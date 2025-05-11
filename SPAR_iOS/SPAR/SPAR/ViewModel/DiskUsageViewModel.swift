//
//  DiskUsageViewModel.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import Foundation
import OSLog
import SwiftUI

class DiskUsageViewModel: ObservableObject {
    @Published var diskUsage: [DiskUsage] = []
    @Published var errorMessage: String = ""
    @Published var isLoading: Bool = false

    private let networkManager = NetworkManager()


    private let logger = Logger.fileLocation

    init(device: DeviceSpecification) {
        let diskInfo = DiskUsage(
            id: 1,
            filesystem: "",
            sizeGB: 1,
            usedGB: 0,
            availableGB: 0,
            userId: 1,
            deviceId: "1",
            timestamp: "".toFormattedDate()
        )
        
        self.diskUsage = []

        
        fetchDiskUsageInfo(device: device)
    }
    
    func fetchDiskUsageInfo(device: DeviceSpecification) {
        Task {
            await MainActor.run {
                self.isLoading = true
            }
            
            do {
                guard let userId = AppSettings.shared.userId else {
                    await MainActor.run {
                        self.isLoading = false
                    }
                    return
                }
                
                let response = try await networkManager.fetchDiskUsage(for: userId, deviceId: device.deviceId)
                
                await MainActor.run {
                    self.diskUsage = response
                    self.isLoading = false
                }
            } catch {
                await MainActor.run {
                    self.errorMessage = "Failed to load disk usage"
                    self.isLoading = false
                }
                logger.error("Failed to fetch Disk Usage info: \(error.localizedDescription)")
            }
        }
    }

}



    
//    func fetchDiskUsage(userId: Int, deviceId: String) async {
//        guard let url = URL(string: "\(Constants.baseURL)/api/metrics/disk-usage/\(userId)/\(deviceId)") else {
//            self.errorMessage = "Invalid URL"
//            return
//        }
//
//        do {
//            let (data, _) = try await URLSession.shared.data(from: url)
//            let decoder = JSONDecoder()
//            let usage = try decoder.decode(DiskUsage.self, from: data)
//
//            DispatchQueue.main.async {
//                self.diskUsage = usage
//            }
//        } catch {
//            DispatchQueue.main.async {
//                self.logger.error("Failed to fetch disk usage: \(error.localizedDescription)")
//                self.errorMessage = "Failed to load disk usage"
//            }
//        }
//    }

