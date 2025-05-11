//
//  NetworkManager.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/19/25.
//

import Foundation

class NetworkManager {
    private let networkService: NetworkServicing
    private let baseURL = "https://mscs-spring2025-capping.onrender.com"
    
    init(networkService: NetworkServicing = NetworkService()) {
        self.networkService = networkService
    }
    
    private func makeURL(endpoint: String, userId: Int, deviceId: String) -> URL? {
        URL(string: "\(baseURL)/api/metrics/\(endpoint)/\(userId)/\(deviceId)")
    }
    
    func fetchDeviceSpecifications(for userId: Int) async throws -> [DeviceSpecification] {
       
        guard let url = URL(string: "https://mscs-spring2025-capping.onrender.com/api/users/\(userId)/getdevices"),let token = AppSettings.shared.authToken else {
            throw URLError(.badURL)
        }
        print("userId",userId)
        print("token",token)
        return try await networkService.get(from: url,token: token)
    }
    func fetchCPUUsageInfo(for userId: Int, deviceId: String) async throws -> CpuUsage {
        guard let url = makeURL(endpoint: "cpu-usage", userId: userId, deviceId: deviceId),let token = AppSettings.shared.authToken  else {
            throw URLError(.badURL)
        }
        
        return try await networkService.get(from: url, token: token)
    }
    func fetchProcessStatus(for userId: Int, deviceId: String) async throws -> [ProcessStatus] {
        guard let url = makeURL(endpoint: "process-status", userId: userId, deviceId: deviceId),let token = AppSettings.shared.authToken  else {
            throw URLError(.badURL)
        }
        return try await networkService.get(from: url, token: token)
    }
    
    func fetchBatteryInfo(for userId: Int, deviceId: String) async throws -> BatteryInfo {
        guard let url = makeURL(endpoint: "battery-info", userId: userId, deviceId: deviceId),let token = AppSettings.shared.authToken  else {
            throw URLError(.badURL)
        }
        return try await networkService.get(from: url, token: token)
    }
    
    func fetchMemoryUsage(for userId: Int, deviceId: String) async throws -> MemoryUsage {
        guard let url = makeURL(endpoint: "ram-usage", userId: userId, deviceId: deviceId),let token = AppSettings.shared.authToken  else {
            throw URLError(.badURL)
        }
        return try await networkService.get(from: url, token: token)
    }
    
    func fetchDiskUsage(for userId: Int, deviceId: String) async throws -> [DiskUsage] {
        guard let url = makeURL(endpoint: "disk-usage", userId: userId, deviceId: deviceId),let token = AppSettings.shared.authToken  else {
            throw URLError(.badURL)
        }
        return try await networkService.get(from: url, token: token)
    }
    
    func fetchDiskIO(for userId: Int, deviceId: String) async throws -> DiskIO {
        guard let url = makeURL(endpoint: "disk-io", userId: userId, deviceId: deviceId),let token = AppSettings.shared.authToken  else {
            throw URLError(.badURL)
        }
        return try await networkService.get(from: url, token: token)
    }
    
    func login(username: String, password: String) async throws -> LoginResponse {
        guard let url = URL(string: "https://mscs-spring2025-capping.onrender.com/api/auth/signin") else {
            throw URLError(.badURL)
        }
        let loginRequest = LoginRequest(username: username, password: password)
        return try await networkService.post(to: url, body: loginRequest)
    }

}

