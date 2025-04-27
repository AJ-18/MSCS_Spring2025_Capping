//
//  MockNetworkService.swift
//  SPARTests
//
//  Created by Abhijeet Cherungottil on 4/19/25.
//

import Foundation

class MockNetworkService: NetworkServicing {
    func post<T, U>(to url: URL, body: U) async throws -> T where T : Decodable, U : Encodable {
        let sampleData = MockData.sampleLoginData
        do {
            let decoded = try JSONDecoder().decode(T.self, from: sampleData)
            return decoded
        } catch {
            print("⚠️ Decoding error: \(error)")
            throw error
        }

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
        } else if url.absoluteString.contains("disk-usage") {
            sampleData = MockData.sampleDiskUsageData
        } else if url.absoluteString.contains("disk-io") {
            sampleData = MockData.sampleDiskIOUsageData
        }  else if url.absoluteString.contains("auth/signin") {
            sampleData = MockData.sampleLoginData
        }
        else {
            throw URLError(.badURL)
        }
        
        return try JSONDecoder().decode(T.self, from: sampleData)
    }
}
