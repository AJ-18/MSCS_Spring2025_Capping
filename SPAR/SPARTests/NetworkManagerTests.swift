import XCTest
@testable import SPAR

final class NetworkManagerTests: XCTestCase {
    
    var networkManager: NetworkManager!
    
    override func setUp() {
        super.setUp()
        networkManager = NetworkManager(networkService: MockNetworkService())
    }
    
    override func tearDown() {
        networkManager = nil
        super.tearDown()
    }
    
    func testFetchDeviceSpecifications() async throws {
        let deviceSpecifications: [DeviceSpecification] = try await networkManager.fetchDeviceSpecifications(for: "user123")
        
        XCTAssertEqual(deviceSpecifications.count, 2)
        XCTAssertEqual(deviceSpecifications.first?.deviceName, "MyComputer")
    }
    
    
    func testFetchBatteryInfo() async throws {
        let batteryInfo: [BatteryInfo] = try await networkManager.fetchBatteryInfo(for: "user123")
        
        XCTAssertEqual(batteryInfo.count, 1)
    }
    
    func testFetchMemoryUsage() async throws {
        let memoryUsage: [MemoryUsage] = try await networkManager.fetchMemoryUsage(for: "user123")
        
        XCTAssertEqual(memoryUsage.count, 1)
    }
}
