//
//  CpuUsageViewModel.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/24/25.
//

import Foundation
import SwiftUI
import OSLog

class CpuUsageViewModel: ObservableObject {
    @Published var cpuUsage: CpuUsage?
    @Published var errorMessage: String = ""
    @Published var chartData: ChartData?

    private let logger = Logger.fileLocation
    private let networkManager = NetworkManager()

    init(device: DeviceSpecification) {
        // Sample data
        let sampleCoreData = [
            CpuCoreUsage(core: 1, usage: 35.0),
            CpuCoreUsage(core: 2, usage: 45.0),
            CpuCoreUsage(core: 3, usage: 50.0),
            CpuCoreUsage(core: 4, usage: 40.0),
            CpuCoreUsage(core: 5, usage: 35.0),
            CpuCoreUsage(core: 6, usage: 45.0),
            CpuCoreUsage(core: 7, usage: 50.0),
            CpuCoreUsage(core: 8, usage: 40.0)
        ]
    
    
        let sampleUsage = CpuUsage(
            id: 7,
            totalCpuLoad: 42.5,
            perCoreUsage: sampleCoreData,
            userId: 1,
            deviceId: "331330ac-5f82-43b0-9d39-84e1f7e7e358",
            timestamp: "2025-04-22T15:57:10.351457".toFormattedDate()
        )

        self.cpuUsage = sampleUsage

        self.chartData = ChartData(
            color: .orange,
            type: "CPU",
            percent: CGFloat(sampleUsage.totalCpuLoad)
        )
        fetchCPUInfo(device: device)
    }
    
    func fetchCPUInfo(device: DeviceSpecification) {
        Task {
            do {
                guard let userId = AppSettings.shared.userId else { return }
                let response = try await networkManager.fetchCPUUsageInfo(for: userId, deviceId: device.id)
                
                    DispatchQueue.main.async {
                        self.cpuUsage = response
                        self.chartData = ChartData(
                            color: Color.purple,
                            type: "CPU",
                            percent: CGFloat(response.totalCpuLoad)
                        )
                    }
                
            } catch {
                print("Failed to fetch CPU info: \(error)")
            }
        }
    }
}

