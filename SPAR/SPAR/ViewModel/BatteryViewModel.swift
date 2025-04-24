//
//  BatteryViewModel.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/23/25.
//

import Foundation

class BatteryViewModel: ObservableObject {
    @Published var batteryInfo: BatteryInfo

    init(device: DeviceSpecification) {
        // Initialize with device information or make an API call to get the battery info
        self.batteryInfo = BatteryInfo(
            id: 1,
            userId: device.userId, // Pass userId from device
            hasBattery: true,
            batteryPercentage: 80,
            powerConsumption: 12.5,
            timestamp: "2025-04-23 14:35".toFormattedDate(),
            charging: false
        )
    }

}
