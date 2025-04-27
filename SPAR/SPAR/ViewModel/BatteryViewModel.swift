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

    init(device: DeviceSpecification) {
        // 1. Set a placeholder batteryInfo first
        self.batteryInfo = BatteryInfo(
            id: 0,
            userId: device.userId,
            hasBattery: true,
            batteryPercentage: 0,
            powerConsumption: 0,
            timestamp: "bb",
            charging: false
        )
        
        // 2. Then fetch actual data from API
        fetchBatteryInfo(device: device)
    }
    
    func fetchBatteryInfo(device: DeviceSpecification) {
        Task {
            do {
                guard let userId = AppSettings.shared.userId else { return }
                let response = try await networkManager.fetchBatteryInfo(for: userId, deviceId: device.id)
                
             
                    DispatchQueue.main.async {
                        self.batteryInfo = response
                    }
                
            } catch {
                print("Failed to fetch battery info: \(error)")
            }
        }
    }
}
