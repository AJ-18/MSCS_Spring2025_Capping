//
//  DiskUsageViewModel.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import Foundation
import OSLog

class DiskUsageViewModel: ObservableObject {
    @Published var diskUsage: DiskUsage?
    @Published var errorMessage: String = ""
    @Published var chartData: ChartData = ChartData(color: .gray, type: "Disk", percent: 0)

    private let logger = Logger.fileLocation

    init() {
        let diskInfo = DiskUsage(
            id: 1,
            filesystem: "/dev/sda1",
            sizeGB: 512.0,
            usedGB: 200.0,
            availableGB: 312.0,
            userId: 1,
            deviceId: "331330ac-5f82-43b0-9d39-84e1f7e7e358",
            timestamp: "2025-04-22T15:57:10.390972".toFormattedDate()
        )
        
        self.diskUsage = diskInfo

        let usedPercent = (diskInfo.usedGB / diskInfo.sizeGB) * 100
        self.chartData = ChartData(
            color: .green,
            type: "Disk",
            percent: CGFloat(usedPercent)
        )
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

