import React, { useMemo, useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  useColorMode,
  useColorModeValue,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";
import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function ApiUsageChart({ userId }) {
  const { colorMode } = useColorMode();

  const bg = useColorModeValue("white", "#111c44");
  const borderColor = useColorModeValue("#E2E8F0", "#333");
  const textColor = useColorModeValue("#1A202C", "#F7FAFC");
  const lineColor = useColorModeValue("#2B6CB0", "#6CB2FF");

  const PERIODS = {
    "12 months": "12months",
    "30 days": "30days",
    "7 days": "7days",
    "24 hours": "24hours",
  };

  const [period, setPeriod] = useState("30days");
  const [chartDataAPI, setChartDataAPI] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---------------------- API CALL ----------------------
  const fetchStats = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/api_hit_stats_chart/", {
        params: { user_id: userId, period },
      });

      setChartDataAPI(res?.data || null);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period, userId]);

  // ---------------------- LABEL FORMATTER ----------------------
  const formatLabel = (label) => {
    // For 24 hours API (e.g., "2025-12-02 14:00")
    if (period === "24hours") {
      const onlyTime = label.split(" ")[1];
      return onlyTime; // "14:00"
    }

    // For 7 days or 30 days — show short date
    if (period === "7days" || period === "30days") {
      return label.split("-").slice(1).join("-"); // "12-02"
    }

    return label;
  };

  // ---------------------- CHART DATA ----------------------
  const chartData = useMemo(() => {
    if (!chartDataAPI)
      return { labels: [], datasets: [] };

    return {
      labels: chartDataAPI.chart_labels.map(formatLabel),
      datasets: [
        {
          label: "API Requests",
          data: chartDataAPI.chart_data,
          borderColor: lineColor,
          backgroundColor: lineColor,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    };
  }, [chartDataAPI, lineColor, period]);

  // ---------------------- CHART OPTIONS ----------------------
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colorMode === "dark" ? "#2a2b2d" : "#ffffff",
          titleColor: textColor,
          bodyColor: textColor,
          borderWidth: 1,
          borderColor: borderColor,
          padding: 12,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: colorMode === "dark" ? "#2f2f31" : "#E2E8F0",
          },
          ticks: { color: textColor },
        },
        x: {
          grid: { display: false },
          ticks: { color: textColor, maxRotation: 0, autoSkip: true },
        },
      },
    }),
    [colorMode]
  );

  return (
    <Box
      bg={bg}
      p={6}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      boxShadow="lg"
      w="100%"
    >
      {/* Header */}
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          API Usage / Request Volume
        </Text>

        <HStack spacing={2}>
          {Object.keys(PERIODS).map((label) => (
            <Button
              key={label}
              size="sm"
              variant={period === PERIODS[label] ? "solid" : "outline"}
              borderColor={borderColor}
              color={textColor}
              bg={
                period === PERIODS[label]
                  ? colorMode === "dark"
                    ? "#2b6cb0"
                    : "#3182ce"
                  : "transparent"
              }
              _hover={{
                bg:
                  period !== PERIODS[label]
                    ? colorMode === "dark"
                      ? "#2b2c2e"
                      : "#f0f0f0"
                    : undefined,
              }}
              onClick={() => setPeriod(PERIODS[label])}
            >
              {label}
            </Button>
          ))}
        </HStack>
      </Flex>

      {/* Percent Change */}
      {chartDataAPI && (
        <Text
          fontSize="md"
          mb={4}
          color={
            chartDataAPI.percentage_change >= 0 ? "green.400" : "red.400"
          }
        >
          {chartDataAPI.percentage_change >= 0 ? "↑" : "↓"}{" "}
          {chartDataAPI.percentage_change}% vs previous period
        </Text>
      )}

      {/* Chart */}
      <Box height="320px">
        {loading ? (
          <Flex justify="center" align="center" height="100%">
            <Spinner size="lg" />
          </Flex>
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </Box>
    </Box>
  );
}
