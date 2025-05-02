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
            do {
                guard let userId = AppSettings.shared.userId else { return }
                let response = try await networkManager.fetchDiskIO(for: userId, deviceId: device.deviceId)
                
                    DispatchQueue.main.async {
                        self.diskIO = response
                    }
                
            } catch {
                print("Failed to fetch Disk io info: \(error)")
            }
        }
    }
}
