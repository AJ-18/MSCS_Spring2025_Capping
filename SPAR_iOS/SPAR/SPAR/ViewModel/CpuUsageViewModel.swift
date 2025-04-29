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
        let sampleCoreData:[CpuCoreUsage] = [] // Empty array as JSON string
         
         let sampleUsage = CpuUsage(
             id: 7,
             totalCpuLoad: 32.1,
             perCoreUsage: sampleCoreData,
             userId: 1,
             deviceId: "1",
             timestamp: "2025-04-22T15:57:10.351457"
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
        // Print to ensure this function is being called
        print("Fetching CPU info for device: \(device.id)")
        
        Task {
            do {
                guard let userId = AppSettings.shared.userId else {
                    print("User ID is nil. Aborting fetch.")
                    return
                }
                print("User ID: \(userId)")
                
                let response = try await networkManager.fetchCPUUsageInfo(for: userId, deviceId: device.id)
                
                print("response",response)
                
                // Update on main thread
                DispatchQueue.main.async {
                    print("Received CPU usage data: \(response)")
                    self.cpuUsage = response
                    self.chartData = ChartData(
                        color: Color.purple,
                        type: "CPU",
                        percent: CGFloat(response.totalCpuLoad)
                    )
                }
                
            } catch {
                print("Failed to fetch CPU info: \(error)")
                DispatchQueue.main.async {
                    self.errorMessage = "Failed to fetch CPU info: \(error.localizedDescription)"
                }
            }
        }
    }
}
