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
        
        var responseData = data
        
        if key == "cpu-usage" {
            
            do {
                var temp = try JSONDecoder().decode(TempCPUUsage.self, from: data)
                
                // Clean perCoreUsageJson
                temp.perCoreUsageJson = temp.perCoreUsageJson
                    .replacingOccurrences(of: "\\", with: "")
                print(temp)
                
               // responseData = try JSONEncoder().encode(temp)
            } catch {
                print("Failed to prepare CPU mock data: \(error.localizedDescription)")
            }
        }
        
        return try JSONDecoder().decode(T.self, from: responseData)
    }


    
    func post<T: Decodable, U: Encodable>(to url: URL, body: U) async throws -> T {
        // Always returning login sample for mock POST
        return try JSONDecoder().decode(T.self, from: MockData.sampleLoginData)
    }
}

struct TempCPUUsage: Codable {
    var id: Int
    var totalCpuLoad: Double
    var perCoreUsageJson: String
    var userId: Int
    var deviceId: String
    var timestamp: String
}
