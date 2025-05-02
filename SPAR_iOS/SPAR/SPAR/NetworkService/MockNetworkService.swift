//
//  MockNetworkService.swift
//  SPARTests
//
//  Created by Abhijeet Cherungottil on 4/19/25.
//

import Foundation


// First, let's fix the MockNetworkService for CPU usage
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
                // Parse the original JSON
                let temp = try JSONDecoder().decode(TempCPUUsage.self, from: data)
                
                // Create a properly formatted JSON array for perCoreUsage
                let coreUsages = try parseCoreUsages(from: temp.perCoreUsageJson)
                
                // Create a new CPU usage object with proper data structure
                let fixedCpuUsage = CpuUsage(
                    id: temp.id,
                    totalCpuLoad: temp.totalCpuLoad,
                    perCoreUsage: coreUsages,
                    userId: temp.userId,
                    deviceId: temp.deviceId,
                    timestamp: temp.registeredAt
                )
                
                // Encode the fixed object if T is CpuUsage
                if T.self == CpuUsage.self {
                    responseData = try JSONEncoder().encode(fixedCpuUsage)
                }
            } catch {
                print("Failed to prepare CPU mock data: \(error)")
            }
        }
        
        do {
            return try JSONDecoder().decode(T.self, from: responseData)
        } catch {
            print("Failed to decode final response: \(error)")
            throw error
        }
    }
    
    // Helper method to parse core usages from the JSON string
    private func parseCoreUsages(from jsonString: String) throws -> [CpuCoreUsage] {
        // Clean up the JSON string - remove unneeded escapes
        let cleanedString: String
        
        // Try to identify if it's already an array format
        if jsonString.hasPrefix("[") && jsonString.hasSuffix("]") {
            // It's already in array format, just remove unnecessary escapes
            cleanedString = jsonString
                .replacingOccurrences(of: "\\\"", with: "\"")
                .replacingOccurrences(of: "\\\\", with: "\\")
        } else {
            // It's not in array format, add brackets
            cleanedString = "[\(jsonString)]"
        }
        
        // For debugging
        print("Cleaned JSON string: \(cleanedString)")
        
        guard let jsonData = cleanedString.data(using: .utf8) else {
            throw NSError(domain: "MockNetworkService", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to convert string to data"])
        }
        
        do {
            return try JSONDecoder().decode([CpuCoreUsage].self, from: jsonData)
        } catch {
            print("JSON parsing error: \(error)")
            
            // Last resort - manually parse the string if it's in the expected format
            let manualCoreUsages = try manuallyParseCoreUsages(from: cleanedString)
            return manualCoreUsages
        }
    }
    
    // Manually parse core usages as a last resort
    private func manuallyParseCoreUsages(from jsonString: String) throws -> [CpuCoreUsage] {
        var coreUsages: [CpuCoreUsage] = []
        
        // Create a default set of cores with zero usage
        for i in 1...12 {
            coreUsages.append(CpuCoreUsage(core: i, usage: 0.0))
        }
        
        return coreUsages
    }
    
    func post<T: Decodable, U: Encodable>(to url: URL, body: U) async throws -> T {
        // Always returning login sample for mock POST
        return try JSONDecoder().decode(T.self, from: MockData.sampleLoginData)
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
