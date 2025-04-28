//
//  MemoryUsageViewModel.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/23/25.
//

import SwiftUI

class MemoryUsageViewModel: ObservableObject {
    @Published var memoryInfo: MemoryUsage
    private let networkManager = NetworkManager()

    @Published var chartData: ChartData

    init(device: DeviceSpecification) {
        // Initializing with some default data or fetching from an API or database.
        let memoryInfo = MemoryUsage(
            id: 1,
            userId: 1,
            totalMemory: 16.0,
            usedMemory: 8.5,
            availableMemory: 7.5,
            timestamp: "2025-04-19".toFormattedDate()
        )
        self.memoryInfo = memoryInfo
        
        let usedPercent = (memoryInfo.usedMemory / memoryInfo.totalMemory) * 100
        self.chartData = ChartData(
            color: Color.purple,
            type: "Memory",
            percent: CGFloat(usedPercent)
        )
        
        fetchRamInfo(device: device)
    }
    func fetchRamInfo(device: DeviceSpecification) {
        Task {
            do {
                guard let userId = AppSettings.shared.userId else { return }
                let response = try await networkManager.fetchMemoryUsage(for: userId, deviceId: device.id)
                
                    DispatchQueue.main.async {
                        self.memoryInfo = response
                        let usedPercent = (response.usedMemory / response.totalMemory) * 100
                        self.chartData = ChartData(
                            color: Color.purple,
                            type: "Memory",
                            percent: CGFloat(usedPercent)
                        )
                    }
                
            } catch {
                print("Failed to fetch memory info: \(error)")
            }
        }
    }
}

