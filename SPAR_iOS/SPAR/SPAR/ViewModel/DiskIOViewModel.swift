//
//  DiskIOViewModel.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import Foundation
import OSLog

class DiskIOViewModel: ObservableObject {
    @Published var diskIO: DiskIO?
    @Published var errorMessage: String = ""
    @Published var isLoading: Bool = false  // ✅ Add isLoading
    private let networkManager = NetworkManager()

    private let logger = Logger.fileLocation

    init(device: DeviceSpecification) {
        // Sample static data for testing purposes
        let sampleDiskIO = DiskIO(
            id: 5,
            readSpeedMBps: 0,
            writeSpeedMBps: 0,
            userId: 1,
            deviceId: "1",
            timestamp: "".toFormattedDate()
        )
        self.diskIO = sampleDiskIO
        fetchDiskIOInfo(device: device)
    }

    // Fetch Disk I/O Data from the API
    func fetchDiskIOInfo(device: DeviceSpecification) {
        Task {
            await MainActor.run {
                self.isLoading = true  // ✅ Start loading
            }
            
            do {
                guard let userId = AppSettings.shared.userId else {
                    await MainActor.run {
                        self.isLoading = false
                        self.errorMessage = "User ID not found"
                    }
                    return
                }

                let response = try await networkManager.fetchDiskIO(for: userId, deviceId: device.deviceId)
                
                await MainActor.run {
                    self.diskIO = response
                    self.isLoading = false  // ✅ Stop loading
                }
                
            } catch {
                print("Failed to fetch Disk IO info: \(error)")
                await MainActor.run {
                    self.errorMessage = "Failed to load Disk IO info"
                    self.isLoading = false  // ✅ Stop loading on error
                }
            }
        }
    }
}
