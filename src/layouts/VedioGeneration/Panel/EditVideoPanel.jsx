import React, { startTransition } from "react";
import { Box, VStack, Text, Input } from "@chakra-ui/react";

const EditVideoPanel = ({ mergeData, setMergeData, textcolor }) => {
  return (
    <VStack align="stretch" spacing={4}>
                            <Box>
                                <Text fontWeight="bold">Trim Start (seconds)</Text>
                                <Input
                                    type="number" placeholder="Start time"
                                    _placeholder={{color:textcolor}}
    color={textcolor}
                                    onChange={(e) => startTransition(() => setMergeData((prev) => ({ ...prev, trim_start: e.target.value })))} // ✅ Wrapped in startTransition
                                    mt={2}
                                />
                            </Box>
    
                            <Box>
                                <Text fontWeight="bold">Trim End (seconds)</Text>
                                <Input
                                    type="number" placeholder="End time"
                                    _placeholder={{color:textcolor}}
    color={textcolor}
                                    onChange={(e) => startTransition(() => setMergeData((prev) => ({ ...prev, trim_end: e.target.value })))} // ✅ Wrapped in startTransition
                                    mt={2}
                                />
                            </Box>
                        </VStack>
  );
};

export default EditVideoPanel;
