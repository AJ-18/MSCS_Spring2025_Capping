import XCTest
@testable import SPAR

final class NetworkManagerTests: XCTestCase {
    
    var networkManager: NetworkManager!
    
    override func setUp() {
        super.setUp()
        networkManager = NetworkManager(networkService: MockNetworkService())
        AppSettings.shared.authToken = "dummyToken" // Set a dummy token
    }
    
    override func tearDown() {
        networkManager = nil
        super.tearDown()
    }
    
    func testFetchDeviceSpecifications() async throws {
        let devices = try await networkManager.fetchDeviceSpecifications(for: 1)
        XCTAssertEqual(devices.count, 2)
        XCTAssertEqual(devices.first?.deviceName, "MyComputer")
    }
    
    func testFetchCPUUsageInfo() async throws {
       //
    }
    
    func testFetchProcessStatus() async throws {
        let processes = try await networkManager.fetchProcessStatus(for: 1, deviceId: "hh")
        XCTAssertEqual(processes.count, 2)
        XCTAssertEqual(processes.first?.name, "chrome.exe")
    }
    
    func testFetchBatteryInfo() async throws {
        let batteryInfo = try await networkManager.fetchBatteryInfo(for: 1, deviceId: "5")
        XCTAssertTrue(batteryInfo.hasBattery)
        XCTAssertEqual(batteryInfo.batteryPercentage, 85)
    }
    
    func testFetchMemoryUsage() async throws {
        let memoryUsage = try await networkManager.fetchMemoryUsage(for: 1, deviceId: "5")
        XCTAssertEqual(memoryUsage.totalMemory, 16.0)
        XCTAssertEqual(memoryUsage.usedMemory, 8.5)
    }
    
    func testFetchDiskUsage() async throws {
        let diskUsage = try await networkManager.fetchDiskUsage(for: 1, deviceId: "5")
        XCTAssertEqual(diskUsage.sizeGB, 512.0)
    }
    
    func testFetchDiskIO() async throws {
        let diskIO = try await networkManager.fetchDiskIO(for: 1, deviceId: "5")
        XCTAssertEqual(diskIO.readSpeedMBps, 120.0)
        XCTAssertEqual(diskIO.writeSpeedMBps, 80.0)
    }
    
    func testLogin() async throws {
        let loginResponse = try await networkManager.login(username: "testUser", password: "testPassword")
        XCTAssertNotNil(loginResponse.token)
    }
}
