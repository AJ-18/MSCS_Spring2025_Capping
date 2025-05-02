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
    @Published var diskUsage: DiskUsage?
    @Published var errorMessage: String = ""
    @Published var chartData: ChartData = ChartData(color: .gray, type: "Disk", percent: 0)
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
        
        self.diskUsage = diskInfo

        let usedPercent = (diskInfo.usedGB / diskInfo.sizeGB) * 100
        self.chartData = ChartData(
            color: .green,
            type: "Disk",
            percent: CGFloat(usedPercent)
        )
        
        fetchDiskUsageInfo(device: device)
    }
    
    func fetchDiskUsageInfo(device: DeviceSpecification) {
        Task {
            do {
                guard let userId = AppSettings.shared.userId else { return }
                let response = try await networkManager.fetchDiskUsage(for: userId, deviceId: device.deviceId)
                
                    DispatchQueue.main.async {
                        self.diskUsage = response
                        let usedPercent = (response.usedGB / response.availableGB) * 100
                        self.chartData = ChartData(
                            color: .green,
                            type: "Disk",
                            percent: CGFloat(usedPercent)
                        )
                    }
                
            } catch {
                print("Failed to fetch Disk Usage info: \(error)")
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

