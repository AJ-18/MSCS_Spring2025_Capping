//
//  BatteryViewModel.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/23/25.
//

import Foundation

class BatteryViewModel: ObservableObject {
    @Published var batteryInfo: BatteryInfo
    private let networkManager = NetworkManager()
    @Published var isLoading = false


    init(device: DeviceSpecification) {
        // 1. Set a placeholder batteryInfo first
        self.batteryInfo = BatteryInfo(
            id: 0,
            userId: 1,
            hasBattery: true,
            batteryPercentage: 0, deviceId: "",
            powerConsumption: 0,
            timestamp: "",
            isCharging: false
        )
        
        // 2. Then fetch actual data from API
        fetchBatteryInfo(device: device)
    }
    
    func fetchBatteryInfo(device: DeviceSpecification) {
        Task {
            guard let userId = AppSettings.shared.userId else { return }

            // Update isLoading on the main thread
            await MainActor.run {
                self.isLoading = true
            }

            do {
                let response = try await networkManager.fetchBatteryInfo(for: userId, deviceId: device.deviceId)

                // Publish on the main thread
                await MainActor.run {
                    self.batteryInfo = response
                    self.isLoading = false
                }

            } catch {
                print("Failed to fetch battery info: \(error)")
                await MainActor.run {
                    self.isLoading = false
                }
            }
        }
    }

}
