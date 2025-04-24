//
//  BatteryViewModel.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/23/25.
//

import Foundation

class BatteryViewModel: ObservableObject {
    let batteryInfo: BatteryInfo = BatteryInfo(
        id: 1,
        userId: "user_123",
        hasBattery: true,
        batteryPercentage: 80,
        powerConsumption: 12.5,
        timestamp: "2025-04-23 14:35",
        charging: false
    )

}
