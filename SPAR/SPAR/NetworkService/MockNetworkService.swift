//
//  MockNetworkService.swift
//  SPARTests
//
//  Created by Abhijeet Cherungottil on 4/19/25.
//

import Foundation


final class MockNetworkService: NetworkServicing {
    
    private let sampleDataMapping: [String: Data] = [
        "device-specifications": MockData.sampleDeviceData,
        "process-status": MockData.sampleProcessData,
        "battery-info": MockData.sampleBatteryData,
        "memory-usage": MockData.sampleMemoryUsageData,
        "disk-usage": MockData.sampleDiskUsageData,
        "disk-io": MockData.sampleDiskIOUsageData,
        "cpu-usage": MockData.sampleCPUUsageData,
        "auth/signin": MockData.sampleLoginData
    ]
    
    func get<T: Decodable>(from url: URL, token: String?) async throws -> T {
        guard let (key, data) = sampleDataMapping.first(where: { url.absoluteString.contains($0.key) }) else {
            throw URLError(.badURL)
        }
        return try JSONDecoder().decode(T.self, from: data)
    }
    
    func post<T: Decodable, U: Encodable>(to url: URL, body: U) async throws -> T {
        // Always returning login sample for mock POST
        return try JSONDecoder().decode(T.self, from: MockData.sampleLoginData)
    }
}
