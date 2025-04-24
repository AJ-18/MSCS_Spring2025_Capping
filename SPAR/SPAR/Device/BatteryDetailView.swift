//
//  BatteryDetailView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/23/25.
//

import SwiftUI

struct BatteryDetailView: View {
    @StateObject private var viewModel = BatteryViewModel()


    var body: some View {
        ZStack {
            // Background
            LinearGradient(colors: [.blue.opacity(0.15), .purple.opacity(0.2)], startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()

            VStack {
                Spacer()

                VStack(spacing: 30) {
                    // Title
                    Text("Battery Status")
                        .font(.title)
                        .fontWeight(.bold)
                        .accessibilityAddTraits(.isHeader)

                    // Battery Visualization
                    VStack(spacing: 8) {
                        ZStack(alignment: .leading) {
                            // Outer battery shell
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.gray.opacity(0.3), lineWidth: 2)
                                .frame(width: 200, height: 80)
                                .background(Color.white.opacity(0.2))
                                .clipShape(RoundedRectangle(cornerRadius: 12))

                            // Fill bar
                            RoundedRectangle(cornerRadius: 10)
                                .fill(batteryColor)
                                .frame(width: batteryFillWidth, height: 70)
                                .animation(.easeInOut(duration: 0.5), value: viewModel.batteryInfo.batteryPercentage)
                                .padding(.leading, 5)

                            // Percentage text
                            Text("\(viewModel.batteryInfo.batteryPercentage)%")
                                .font(.title2)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                                .frame(width: 200, height: 80)
                                .background(Color.clear)
                        }

            
                    }

                    // Info Rows
                    VStack(alignment: .leading, spacing: 15) {
                        InfoRow(label: "Charging", value: viewModel.batteryInfo.charging ? "Yes ⚡️" : "No")
                        InfoRow(label: "Power Consumption", value: String(format: "%.2f W", viewModel.batteryInfo.powerConsumption))
                        InfoRow(label: "Timestamp", value: viewModel.batteryInfo.timestamp)
                    }
                }
                .padding()
                .frame(maxWidth: 320)
                .background(Color.white)
                .cornerRadius(16)
                .shadow(color: Color.black.opacity(0.1), radius: 10, x: 0, y: 5)

                Spacer()
            }
            .padding()
        }
    }

    private var batteryFillWidth: CGFloat {
        let maxWidth: CGFloat = 190
        return maxWidth * CGFloat(viewModel.batteryInfo.batteryPercentage) / 100
    }

    private var batteryColor: Color {
        switch viewModel.batteryInfo.batteryPercentage {
        case 0..<20:
            return .red
        case 20..<50:
            return .orange
        case 50..<80:
            return .yellow
        default:
            return .green
        }
    }
}

struct InfoRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .fontWeight(.semibold)
                .foregroundColor(.gray)
            Spacer()
            Text(value)
                .foregroundColor(.black)
        }
    }
}

#Preview {
    BatteryDetailView()
}

