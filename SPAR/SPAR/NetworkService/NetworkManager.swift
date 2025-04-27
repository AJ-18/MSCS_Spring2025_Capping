//
//  NetworkManager.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/19/25.
//

import Foundation

class NetworkManager {
    private let networkService: NetworkServicing
    private let baseURL = "http://localhost:8080/api/metrics"
    
    init(networkService: NetworkServicing = MockNetworkService()) {
        self.networkService = networkService
    }
    
    private func makeURL(endpoint: String, userId: Int, deviceId: Int) -> URL? {
        URL(string: "\(baseURL)/\(endpoint)/\(userId)/\(deviceId)")
    }
    
    func fetchDeviceSpecifications(for userId: Int) async throws -> [DeviceSpecification] {
        guard let url = URL(string: "http://localhost:8080/api/device-specifications/\(userId)"),let token = AppSettings.shared.authToken else {
            throw URLError(.badURL)
        }
        return try await networkService.get(from: url,token: token)
    }
    func fetchCPUUsageInfo(for userId: Int, deviceId: Int) async throws -> CpuUsage {
        guard let url = makeURL(endpoint: "cpu-usage", userId: userId, deviceId: deviceId),let token = AppSettings.shared.authToken  else {
            throw URLError(.badURL)
        }
        return try await networkService.get(from: url, token: token)
    }
    func fetchProcessStatus(for userId: Int, deviceId: Int) async throws -> [ProcessStatus] {
        guard let url = makeURL(endpoint: "process-status", userId: userId, deviceId: deviceId),let token = AppSettings.shared.authToken  else {
            throw URLError(.badURL)
        }
        return try await networkService.get(from: url, token: token)
    }
    
    func fetchBatteryInfo(for userId: Int, deviceId: Int) async throws -> BatteryInfo {
        guard let url = makeURL(endpoint: "battery-info", userId: userId, deviceId: deviceId),let token = AppSettings.shared.authToken  else {
            throw URLError(.badURL)
        }
        return try await networkService.get(from: url, token: token)
    }
    
    func fetchMemoryUsage(for userId: Int, deviceId: Int) async throws -> MemoryUsage {
        guard let url = makeURL(endpoint: "memory-usage", userId: userId, deviceId: deviceId),let token = AppSettings.shared.authToken  else {
            throw URLError(.badURL)
        }
        return try await networkService.get(from: url, token: token)
    }
    
    func fetchDiskUsage(for userId: Int, deviceId: Int) async throws -> DiskUsage {
        guard let url = makeURL(endpoint: "disk-usage", userId: userId, deviceId: deviceId),let token = AppSettings.shared.authToken  else {
            throw URLError(.badURL)
        }
        return try await networkService.get(from: url, token: token)
    }
    
    func fetchDiskIO(for userId: Int, deviceId: Int) async throws -> DiskIO {
        guard let url = makeURL(endpoint: "disk-io", userId: userId, deviceId: deviceId),let token = AppSettings.shared.authToken  else {
            throw URLError(.badURL)
        }
        return try await networkService.get(from: url, token: token)
    }
    
    func login(username: String, password: String) async throws -> LoginResponse {
        guard let url = URL(string: "http://localhost:8080/api/auth/signin") else {
            throw URLError(.badURL)
        }
        let loginRequest = LoginRequest(username: username, password: password)
        return try await networkService.post(to: url, body: loginRequest)
    }

}

