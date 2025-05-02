//
//  MockNetworkService.swift
//  SPARTests
//
//  Created by Abhijeet Cherungottil on 4/19/25.
//

import Foundation


// First, let's fix the MockNetworkService for CPU usage
final class MockNetworkService: NetworkServicing {
    
    enum Endpoint: String, CaseIterable {
        case device = "device-specifications"
        case process = "process-status"
        case battery = "battery-info"
        case memory = "ram-usage"
        case disk = "disk-usage"
        case diskIO = "disk-io"
        case cpu = "cpu-usage"
        case login = "auth/signin"
    }
    
    func get<T: Decodable>(from url: URL, token: String?) async throws -> T {
        guard let endpoint = Endpoint.allCases.first(where: { url.absoluteString.contains($0.rawValue) }) else {
            throw URLError(.unsupportedURL)
        }

        let mockData: Data
        switch endpoint {
        case .device: mockData = SimpleMockData.device
        case .process: mockData = SimpleMockData.process
        case .battery: mockData = SimpleMockData.battery
        case .memory: mockData = SimpleMockData.memory
        case .disk: mockData = SimpleMockData.disk
        case .diskIO: mockData = SimpleMockData.diskIO
        case .cpu:
            let decoded = try JSONDecoder().decode(TempCPUUsage.self, from: SimpleMockData.cpu)
            let parsedCore = try JSONDecoder().decode([CpuCoreUsage].self, from: decoded.perCoreUsageJson.data(using: .utf8)!)
            let final = CpuUsage(id: decoded.id,
                                 totalCpuLoad: decoded.totalCpuLoad,
                                 perCoreUsage: parsedCore,
                                 userId: decoded.userId,
                                 deviceId: decoded.deviceId,
                                 timestamp: decoded.registeredAt)
            return final as! T
        case .login: mockData = SimpleMockData.login
        }
        
        return try JSONDecoder().decode(T.self, from: mockData)
    }

    func post<T: Decodable, U: Encodable>(to url: URL, body: U) async throws -> T {
        return try JSONDecoder().decode(T.self, from: SimpleMockData.login)
    }
}
// Helper extension to debug JSON data
extension Data {
    var prettyPrintedJSONString: String? {
        guard let object = try? JSONSerialization.jsonObject(with: self, options: []),
              let data = try? JSONSerialization.data(withJSONObject: object, options: [.prettyPrinted]),
              let prettyPrintedString = String(data: data, encoding: .utf8) else { return nil }
        
        return prettyPrintedString
    }
}

// Optionally, for debugging purposes
extension MockData {
    static func printSampleCPUUsageData() {
        print("Raw CPU Data:")
        print(sampleCPUUsageData.prettyPrintedJSONString ?? "Could not pretty print")
    }
}
struct TempCPUUsage: Codable {
    var id: Int
    var totalCpuLoad: Double
    var perCoreUsageJson: String
    var userId: Int
    var deviceId: String
    var registeredAt: String
}
struct SimpleMockData {
    static let device = MockData.sampleDeviceData
    static let process = MockData.sampleProcessData
    static let battery = MockData.sampleBatteryData
    static let memory = MockData.sampleMemoryUsageData
    static let disk = MockData.sampleDiskUsageData
    static let diskIO = MockData.sampleDiskIOUsageData
    static let cpu = MockData.sampleCPUUsageData
    static let login = MockData.sampleLoginData
}
