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

    private let logger = Logger.fileLocation

    init() {
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
    }

    // Fetch Disk I/O Data from the API
    /*func fetchDiskIO(userId: Int, deviceId: String) async {
        guard let url = URL(string: "\(Constants.baseURL)/api/metrics/disk-io/\(userId)/\(deviceId)") else {
            self.errorMessage = "Invalid URL"
            return
        }

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let decoder = JSONDecoder()
            let diskIO = try decoder.decode(DiskIO.self, from: data)

            DispatchQueue.main.async {
                self.diskIO = diskIO
            }
        } catch {
            DispatchQueue.main.async {
                self.logger.error("Failed to fetch disk I/O data: \(error.localizedDescription)")
                self.errorMessage = "Failed to load disk I/O data"
            }
        }
    }*/
}
