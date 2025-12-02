import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Flex,
  Icon,
  SimpleGrid,
  Spinner,
  Text,
  Button,
  Skeleton,
  useColorModeValue,
  Input,
} from "@chakra-ui/react";
import {
  MdFileCopy,
  MdVideoLibrary,
  MdImage,
  MdAttachMoney,
  MdAddTask,
  MdVpnKey,
} from "react-icons/md";
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import axiosInstance from "utils/AxiosInstance";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PieChart from "components/charts/PieChart";
import TotalSpent from "./components/TotalSpent";
export default function UserReports() {
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false); // no full-page loading
  const [activeUserId, setActiveUserId] = useState(null);

  // Ranges
  const ranges = [
    { label: "24 Hours", value: "24_hours" },
    { label: "1 Week", value: "1_week" },
    { label: "1 Month", value: "1_month" },
    { label: "6 Months", value: "6_months" },
    { label: "1 Year", value: "1_year" },
    { label: "Custom", value: "custom" },
  ];
  const [activeRange, setActiveRange] = useState("1_month");

  const [customDates, setCustomDates] = useState({
    startDate: null,
    endDate: null,
  });

  // Get active user
  const getActiveUserId = () => {
    const selectedUser = JSON.parse(localStorage.getItem("selected_user") || "null");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return selectedUser?.user_id || user?.user_id || null;
  };

  // Formula logic
  const computeDates = (range) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (range) {
      case "24_hours":
        startDate.setDate(endDate.getDate() - 1);
        break;
      case "1_week":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "1_month":
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case "6_months":
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case "1_year":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case "custom":
        startDate = customDates.startDate || endDate;
        endDate = customDates.endDate || endDate;
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 1);
    }

    const format = (d) => d.toISOString().split("T")[0];
    return { start_date: format(startDate), end_date: format(endDate) };
  };

  // Fetch API
  const fetchDashboard = useCallback(async () => {
    const userId = getActiveUserId();
    if (!userId) return;

    setLoading(true);

    try {
      const { start_date, end_date } = computeDates(activeRange);
      const response = await axiosInstance.get(
        `/user_report_summary/?user_id=${userId}&start_date=${start_date}&end_date=${end_date}`
      );

      setDashboardData(response.data);
    } catch (err) {
      setDashboardData({
        total_projects: 0,
        total_image_assets: 0,
        total_api_keys: 0,
        total_cloudinary_video_url: 0,
        total_processed_video_url: 0,
        total_animated_ovrelay_video_url: 0,
        total_api_hits: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [activeRange, customDates]);

  // Detect user
  useEffect(() => {
    const updateActiveUser = () => setActiveUserId(getActiveUserId());
    updateActiveUser();
    const interval = setInterval(updateActiveUser, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch data
  useEffect(() => {
    if (activeUserId) fetchDashboard();
  }, [activeUserId, activeRange, customDates, fetchDashboard]);

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }} px={4}>

      {/* DATE FILTERS */}
      <Box
      
        p={4}
      >
        {/* Tabs */}
        <Flex mb={4} wrap="wrap" gap={2}>
          {ranges.map((range) => (
            <Button
              key={range.value}
              size="sm"
              variant={activeRange === range.value ? "solid" : "outline"}
              colorScheme="brand"
              onClick={() => setActiveRange(range.value)}
            >
              {range.label}
            </Button>
          ))}
        </Flex>

        {/* Custom Date Range */}
        {activeRange === "custom" && (
          <Box
            mt={2}
            p={4}
            borderRadius="10px"
            bg={useColorModeValue("gray.50", "whiteAlpha.50")}
            border="1px solid"
            borderColor={useColorModeValue("gray.200", "whiteAlpha.200")}
            animation="fadeIn 0.3s ease"
          >
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-5px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            <Text mb={3} fontWeight="600">Select Custom Date Range</Text>

            <Flex gap={4} align="center">
              <Box>
                <Text fontSize="13px" mb={1}>Start Date</Text>
                <DatePicker
                  selected={customDates.startDate}
                  onChange={(date) => setCustomDates({ ...customDates, startDate: date })}
                  dateFormat="yyyy-MM-dd"
                  customInput={<Input w="160px" />}
                />
              </Box>

              <Box>
                <Text fontSize="13px" mb={1}>End Date</Text>
                <DatePicker
                  selected={customDates.endDate}
                  onChange={(date) => setCustomDates({ ...customDates, endDate: date })}
                  dateFormat="yyyy-MM-dd"
                  customInput={<Input w="160px" />}
                />
              </Box>
            </Flex>
          </Box>
        )}
      </Box>

      {/* DASHBOARD CARDS */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="20px">

        {[
          { name: "Total Projects", value: "total_projects", icon: MdFileCopy },
          { name: "Total Image Assets", value: "total_image_assets", icon: MdImage },
          { name: "Total API Keys", value: "total_api_keys", icon: MdVpnKey },
          { name: "Cloudinary Videos", value: "total_cloudinary_video_url", icon: MdVideoLibrary },
          { name: "Processed Videos", value: "total_processed_video_url", icon: MdVideoLibrary },
          { name: "Animated Overlay Videos", value: "total_animated_ovrelay_video_url", icon: MdAddTask },
          { name: "API Hits", value: "total_api_hits", icon: MdAttachMoney },
        ].map((item) => (
          <MiniStatistics
            key={item.name}
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={<Icon as={item.icon} w="32px" h="32px" color={brandColor} />}
              />
            }
            name={item.name}
            value={
              loading ? (
                <Skeleton height="20px" width="60px" borderRadius="6px" />
              ) : (
                dashboardData?.[item.value] ?? 0
              )
            }
          />
        ))}
      </SimpleGrid>
      <Box mt={4}>
      <TotalSpent  userId={activeUserId}/>
      </Box>
    </Box>
  );
}
