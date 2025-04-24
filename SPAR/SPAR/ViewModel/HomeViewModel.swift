//
//  HomeViewModel.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/18/25.
//

import Foundation
import SwiftUI

class HomeViewModel: ObservableObject {
    @Published var isSearching = false
    @Published var searchText = ""
    // Accepts list of DeviceSpecification
    let devices: [DeviceSpecification] = [
        DeviceSpecification(
            id: 1,
            userId: "User123",
            deviceName: "MyComputer",
            manufacturer: "Dell",
            model: "Inspiron 15",
            processor: "Intel Core i7 2.8 GHz",
            cpuPhysicalCores: 4,
            cpuLogicalCores: 8,
            installedRam: 16.0,
            graphics: "NVIDIA GTX 1650",
            operatingSystem: "Windows 10 x64",
            systemType: "x64-based processor",
            timestamp: "2025-03-28T16:03:30.041384"
        )
    ]

    var filteredDevices: [DeviceSpecification] {
        if searchText.isEmpty {
            return devices
        } else {
            return devices.filter {
                $0.deviceName.localizedCaseInsensitiveContains(searchText) ||
                $0.manufacturer.localizedCaseInsensitiveContains(searchText) ||
                $0.model.localizedCaseInsensitiveContains(searchText) ||
                $0.processor.localizedCaseInsensitiveContains(searchText) ||
                $0.graphics.localizedCaseInsensitiveContains(searchText) ||
                $0.operatingSystem.localizedCaseInsensitiveContains(searchText)
            }
        }
    }

    func startSearching() {
        withAnimation {
            isSearching = true
        }
    }

    func cancelSearching() {
        withAnimation {
            isSearching = false
            searchText = ""
        }
    }
}
