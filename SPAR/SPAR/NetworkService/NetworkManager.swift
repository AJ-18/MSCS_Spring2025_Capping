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
    
    private func makeURL(endpoint: String, userId: Int) -> URL? {
        URL(string: "\(baseURL)/\(endpoint)/\(userId)")
    }
    
    func fetchDeviceSpecifications(for userId: Int) async throws -> [DeviceSpecification] {
        guard let url = makeURL(endpoint: "device-specifications", userId: userId) else {
            throw URLError(.badURL)
        }
        return try await networkService.get(from: url,token: nil)
    }
    
    func fetchProcessStatus(for userId: Int) async throws -> [ProcessStatus] {
        guard let url = makeURL(endpoint: "process-status", userId: userId) else {
            throw URLError(.badURL)
        }
        return try await networkService.get(from: url, token: nil)
    }
    
    func fetchBatteryInfo(for userId: Int) async throws -> [BatteryInfo] {
        guard let url = makeURL(endpoint: "battery-info", userId: userId) else {
            throw URLError(.badURL)
        }
        return try await networkService.get(from: url, token: nil)
    }
    
    func fetchMemoryUsage(for userId: Int) async throws -> [MemoryUsage] {
        guard let url = makeURL(endpoint: "memory-usage", userId: userId) else {
            throw URLError(.badURL)
        }
        return try await networkService.get(from: url, token: nil)
    }
    
    func login(username: String, password: String) async throws -> LoginResponse {
        guard let url = URL(string: "http://localhost:8080/api/auth/signin") else {
            throw URLError(.badURL)
        }
        let loginRequest = LoginRequest(username: username, password: password)
        return try await networkService.post(to: url, body: loginRequest)
    }

}

