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
            readSpeedMBps: 120.0,
            writeSpeedMBps: 80.0,
            userId: 1,
            deviceId: "331330ac-5f82-43b0-9d39-84e1f7e7e358",
            timestamp: "2025-04-22T15:57:10.377292".toFormattedDate()
        )
        self.diskIO = sampleDiskIO
        fetchDiskIOInfo(device: device)
    }

    // Fetch Disk I/O Data from the API
    func fetchDiskIOInfo(device: DeviceSpecification) {
        Task {
            do {
                guard let userId = AppSettings.shared.userId else { return }
                let response = try await networkManager.fetchDiskIO(for: userId, deviceId: device.id)
                
                    DispatchQueue.main.async {
                        self.diskIO = response
                    }
                
            } catch {
                print("Failed to fetch Disk io info: \(error)")
            }
        }
    }
}
