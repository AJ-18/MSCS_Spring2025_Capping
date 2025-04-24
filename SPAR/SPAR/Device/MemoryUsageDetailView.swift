//
//  MemoryUsageDetailView.swift
//  SPAR
//
//  Created by Abhijeet Cherungottil on 4/23/25.
//

import SwiftUI

struct MemoryUsageDetailView: View {
    @StateObject private var viewModel = MemoryUsageViewModel()

    var body: some View {
        ZStack {
            LinearGradient(colors: [.mint.opacity(0.2), .cyan.opacity(0.2)], startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()

            VStack(spacing: 30) {
                Text("Memory Usage")
                    .font(.largeTitle)
                    .bold()
                    .accessibilityAddTraits(.isHeader)

                // Pass chart data from viewModel to the HalfDonutChart
                HalfDonutChart(chartDataObj: $viewModel.chartData)

                VStack(alignment: .leading, spacing: 15) {
                    InfoRow(label: "Total Memory", value: String(format: "%.2f GB", viewModel.memoryInfo.totalMemory))
                    InfoRow(label: "Used Memory", value: String(format: "%.2f GB", viewModel.memoryInfo.usedMemory))
                    InfoRow(label: "Available Memory", value: String(format: "%.2f GB", viewModel.memoryInfo.availableMemory))
                    InfoRow(label: "Timestamp", value: viewModel.memoryInfo.timestamp)
                }
                .padding()
                .frame(maxWidth: 320)
                .background(Color.white)
                .cornerRadius(12)
                .shadow(color: Color.black.opacity(0.1), radius: 6, x: 0, y: 4)

                Spacer()
            }
            .padding()
        }
    }
}

#Preview {
    MemoryUsageDetailView()
}
