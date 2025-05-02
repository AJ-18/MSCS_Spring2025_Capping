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
    @Published var isLoading: Bool = false
    private let logger = Logger.fileLocation
    private let networkManager = NetworkManager()

    init(device: DeviceSpecification) {
        // Sample data
        let sampleCoreData:[CpuCoreUsage] = [] // Empty array as JSON string
         
         let sampleUsage = CpuUsage(
             id: 7,
             totalCpuLoad: 0,
             perCoreUsage: sampleCoreData,
             userId: 1,
             deviceId: "1",
             timestamp: "1"
         )
         
         self.cpuUsage = sampleUsage
         
         self.chartData = ChartData(
             color: .orange,
             type: "CPU",
             percent: CGFloat(sampleUsage.totalCpuLoad)
         )
         
         // Call fetchCPUInfo to load real data
         fetchCPUInfo(device: device)
    }
    
    func fetchCPUInfo(device: DeviceSpecification) {
        print("Fetching CPU info for device: \(device.id)")

        Task {
            await MainActor.run {
                self.isLoading = true
            }

            do {
                guard let userId = AppSettings.shared.userId else {
                    print("User ID is nil. Aborting fetch.")
                    await MainActor.run {
                        self.isLoading = false
                    }
                    return
                }

                print("User ID: \(userId)")
                let response = try await networkManager.fetchCPUUsageInfo(for: userId, deviceId: device.deviceId)
                print("response", response)

                await MainActor.run {
                    print("Received CPU usage data: \(response)")
                    self.cpuUsage = response
                    self.chartData = ChartData(
                        color: Color.purple,
                        type: "CPU",
                        percent: CGFloat(response.totalCpuLoad)
                    )
                    self.isLoading = false
                }

            } catch {
                print("Failed to fetch CPU info: \(error)")
                await MainActor.run {
                    self.errorMessage = "Failed to fetch CPU info: \(error.localizedDescription)"
                    self.isLoading = false
                }
            }
        }
    }


}
