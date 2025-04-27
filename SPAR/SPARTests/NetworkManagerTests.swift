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
        let deviceSpecifications: [DeviceSpecification] = try await networkManager.fetchDeviceSpecifications(for: 1)
        
        XCTAssertEqual(deviceSpecifications.count, 2)
        XCTAssertEqual(deviceSpecifications.first?.deviceName, "MyComputer")
    }
    
    

}
