//
//  ProcessViewModel.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/23/25.
//

import Foundation

class ProcessViewModel: ObservableObject {
    @Published var processList: [ProcessStatus]
    private let networkManager = NetworkManager()
    @Published var isLoading = false
    
    init(device: DeviceSpecification) {
         processList = []
        fetchProcessInfo(device: device)
    }
    
    func fetchProcessInfo(device: DeviceSpecification) {
        Task {
            do {
                DispatchQueue.main.async {
                    self.isLoading = true
                    
                }
                defer { isLoading = false }
                guard let userId = AppSettings.shared.userId else { return }
                let response = try await networkManager.fetchProcessStatus(for: userId, deviceId: device.deviceId)
                
                    DispatchQueue.main.async {
                        self.processList = response
                        self.isLoading = false
                }
            } catch {
                print("Failed to fetch Process info: \(error)")
            }
        }
    }


}
