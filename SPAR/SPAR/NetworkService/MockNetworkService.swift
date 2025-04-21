//
//  MockNetworkService.swift
//  SPARTests
//
//  Created by Abhijeet Cherungottil on 4/19/25.
//

import Foundation

class MockNetworkService: NetworkServicing {
    func post<T, U>(to url: URL, body: U) async throws -> T where T : Decodable, U : Encodable {
        throw URLError(.unsupportedURL)
    }

    
    func get<T: Decodable>(from url: URL, token: String?) async throws -> T {
        let sampleData: Data
        
        if url.absoluteString.contains("device-specifications") {
            sampleData = MockData.sampleDeviceData
        } else if url.absoluteString.contains("process-status") {
            sampleData = MockData.sampleProcessData
        } else if url.absoluteString.contains("battery-info") {
            sampleData = MockData.sampleBatteryData
        } else if url.absoluteString.contains("memory-usage") {
            sampleData = MockData.sampleMemoryUsageData
        } else {
            throw URLError(.badURL)
        }
        
        return try JSONDecoder().decode(T.self, from: sampleData)
    }
}
