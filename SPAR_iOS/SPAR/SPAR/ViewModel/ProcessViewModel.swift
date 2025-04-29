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

    
    init(device: DeviceSpecification) {
         processList = []
        fetchProcessInfo(device: device)
    }
    
    func fetchProcessInfo(device: DeviceSpecification) {
        Task {
            do {
                guard let userId = AppSettings.shared.userId else { return }
                let response = try await networkManager.fetchProcessStatus(for: userId, deviceId: device.id)
                
                    DispatchQueue.main.async {
                        self.processList = response
                }
            } catch {
                print("Failed to fetch Process info: \(error)")
            }
        }
    }


}
