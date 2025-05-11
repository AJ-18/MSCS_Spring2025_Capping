//
//  MemoryUsageViewModel.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/23/25.
//

import SwiftUI

class MemoryUsageViewModel: ObservableObject {
    @Published var memoryInfo: MemoryUsage
    @Published var chartData: ChartData
    @Published var isLoading = false

    private let networkManager = NetworkManager()

    init(device: DeviceSpecification) {
        // Default placeholder
        let memoryInfo = MemoryUsage(
            id: 1,
            userId: 1,
            deviceId: "",
            totalMemory: 1,
            usedMemory: 0.0,
            availableMemory: 0.0,
            timestamp: "".toFormattedDate()
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
            guard let userId = AppSettings.shared.userId else { return }

            await MainActor.run {
                self.isLoading = true
            }

            do {
                let response = try await networkManager.fetchMemoryUsage(for: userId, deviceId: device.deviceId)

                await MainActor.run {
                    self.memoryInfo = response
                    let usedPercent = (response.usedMemory / response.totalMemory) * 100
                    self.chartData = ChartData(
                        color: Color.purple,
                        type: "Memory",
                        percent: CGFloat(usedPercent)
                    )
                    self.isLoading = false
                }

            } catch {
                print("Failed to fetch memory info: \(error)")
                await MainActor.run {
                    self.isLoading = false
                }
            }
        }
    }
}
