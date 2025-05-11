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
    @Published var animate: Bool = false
    private let networkManager = NetworkManager()
    @Published var devices: [DeviceSpecification] = []
    @Published var showDownloadPopup: Bool = false // Add this property to control the popup visibility
    
    init() {
        getDeviceData()
    }

    var filteredDevices: [DeviceSpecification] {
        if searchText.isEmpty {
            return devices
        } else {
            return devices.filter {
                $0.deviceName.localizedCaseInsensitiveContains(searchText)
            }
        }
    }
    
    func signOut(currentView: Binding<AppView>) {
        AppSettings.shared.clearUserSession()
        DispatchQueue.main.async {
            currentView.wrappedValue = .login // Redirect to login screen
        }
    }

    
    func getDeviceData() {
        Task {
            do {
                guard let id = AppSettings.shared.userId else {return }
                let response = try await networkManager.fetchDeviceSpecifications(for:  id)
                print(response)
                DispatchQueue.main.async {
                    self.devices = response
                    // Check if the response is empty, and if so, show the download popup
                    self.showDownloadPopup = response.isEmpty
                }

            } catch {
                print("⚠️ Decoding error: \(error)")

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


//DeviceSpecification(
//    id: 1,
//    userId: "User123",
//    deviceName: "MyComputer",
//    manufacturer: "Dell",
//    model: "Inspiron 15",
//    processor: "Intel Core i7 2.8 GHz",
//    cpuPhysicalCores: 4,
//    cpuLogicalCores: 8,
//    installedRam: 16.0,
//    graphics: "NVIDIA GTX 1650",
//    operatingSystem: "Windows 10 x64",
//    systemType: "x64-based processor",
//    registeredAt: "2025-03-28T16:03:30.041384"
//)
