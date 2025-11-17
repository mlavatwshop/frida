import { useState, useMemo, useRef, useEffect } from 'react'
import { Container, Paper, Title, Text, Table, Stack, Box, Group, Badge, Switch } from '@mantine/core'
import { IconArrowUp, IconArrowDown } from '@tabler/icons-react'
import {
  ImgComparisonSlider,
} from '@img-comparison-slider/react'

/**
 * Displays a comparison table and interactive slider to compare image variants
 */
const ImageComparison = ({ variants }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [isVertical, setIsVertical] = useState(false)
  const [isDarkHandle, setIsDarkHandle] = useState(false)
  const sliderRef = useRef(null)

  // Find the 1x variant to use as the base
  const baseImage = useMemo(() => {
    return variants.find(v => v.label === '1x')
  }, [variants])

  const dimensions = useMemo(() => {
    if (baseImage) {
      return { width: baseImage.width, height: baseImage.height }
    }
    return { width: 0, height: 0 }
  }, [baseImage])

  // Get default selected image (3x) or use the current selection
  const activeSelection = useMemo(() => {
    if (selectedImage) return selectedImage
    
    // Default to 3x - find smallest filesize format
    if (variants.length > 0) {
      const threeXVariant = variants.find(v => v.label === '3x')
      if (threeXVariant && threeXVariant.files.length > 0) {
        // Find the file with smallest size
        const smallestFile = threeXVariant.files.reduce((smallest, current) => 
          current.size < smallest.size ? current : smallest
        )
        return { variant: threeXVariant, file: smallestFile }
      }
    }
    return null
  }, [variants, selectedImage])

  // Calculate which format has the highest and lowest filesize for each variant
  const filesizeLabelsByVariant = useMemo(() => {
    const result = {}
    variants.forEach(variant => {
      if (variant.files.length > 0) {
        const highestFile = variant.files.reduce((highest, current) => 
          current.size > highest.size ? current : highest
        )
        const lowestFile = variant.files.reduce((lowest, current) => 
          current.size < lowest.size ? current : lowest
        )
        result[variant.label] = {
          biggest: highestFile.format,
          smallest: lowestFile.format
        }
      }
    })
    return result
  }, [variants])

  if (!variants.length || !baseImage) {
    return null
  }

  // Organize data for the table: rows = formats, columns = scales
  const formats = ['PNG', 'JPEG', 'WebP']
  const scales = variants.map(v => v.label)

  const handleCellClick = (variant, file) => {
    // If clicking on 1x, select the smallest filesize format
    if (variant.label === '1x' && variant.files.length > 0) {
      const smallestFile = variant.files.reduce((smallest, current) => 
        current.size < smallest.size ? current : smallest
      )
      setSelectedImage({ variant, file: smallestFile })
    } else {
      setSelectedImage({ variant, file })
    }
  }

  // Get the base 1x PNG for comparison
  const basePngFile = baseImage?.files.find(f => f.format === 'PNG')
  const sliderBaseLabel = baseImage && basePngFile ? `${baseImage.label} ${basePngFile.format}` : ''
  const sliderActiveLabel = activeSelection
    ? `${activeSelection.variant.label} ${activeSelection.file.format}`
    : ''

  // Set vertical attribute on web component
  useEffect(() => {
    if (sliderRef.current) {
      if (isVertical) {
        sliderRef.current.setAttribute('direction', 'vertical')
      } else {
        sliderRef.current.setAttribute('direction', 'horizontal')
      }
    }
  }, [isVertical, activeSelection])

  return (
    <Container size="lg" py="md">
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Title order={2} mb="md">Image Comparison</Title>
        <Text size="sm" c="dimmed" mb="lg">
          Click any cell to compare it with the 1x PNG baseline
        </Text>

        <Stack gap="xl">
          {/* Comparison Table */}
          <Table 
            striped 
            highlightOnHover 
            withTableBorder
            withColumnBorders
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Format</Table.Th>
                {scales.map(scale => (
                  <Table.Th key={scale} style={{ textAlign: 'center' }}>
                    {scale}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {formats.map(format => (
                  <Table.Tr key={format}>
                    <Table.Td>
                      <Text fw={600}>{format}</Text>
                    </Table.Td>
                    {variants.map(variant => {
                      const file = variant.files.find(f => f.format === format)
                      const isSelected = activeSelection?.file?.url === file?.url
                      const isBase = variant.label === '1x' && format === 'PNG'
                      const labels = filesizeLabelsByVariant[variant.label]
                      const isBiggest = labels?.biggest === format
                      const isSmallest = labels?.smallest === format
                      
                      return (
                        <Table.Td 
                          key={`${variant.label}-${format}`}
                          onClick={() => file && handleCellClick(variant, file)}
                          style={{ 
                            textAlign: 'center',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? 'var(--mantine-color-blue-light)' : 
                                           isBase ? 'var(--mantine-color-gray-light)' : undefined,
                            fontWeight: isBase ? 600 : undefined,
                          }}
                        >
                          {file ? (
                            <Group gap={4} justify="center" wrap="nowrap">
                              <Text size="sm">{file.prettySize}</Text>
                              {isBiggest && (
                                <IconArrowUp size={14} style={{ color: 'red' }} />
                              )}
                              {isSmallest && (
                                <IconArrowDown size={14} style={{ color: 'green' }} />
                              )}
                            </Group>
                          ) : '-'}
                        </Table.Td>
                      )
                    })}
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>

          {/* Image Comparison Slider */}
          {activeSelection && basePngFile && (
            <Box>
              <Group justify="space-between" mb="md" wrap="wrap">
                <Text size="sm" fw={500}>
                  Comparing: {sliderBaseLabel || '1x PNG'} (baseline) ↔ {sliderActiveLabel}
                </Text>
                <Group gap="lg">
                  <Switch
                    label="Vertical mode"
                    checked={isVertical}
                    onChange={(event) => setIsVertical(event.currentTarget.checked)}
                  />
                  <Switch
                    label="Dark handle"
                    checked={isDarkHandle}
                    onChange={(event) => setIsDarkHandle(event.currentTarget.checked)}
                  />
                </Group>
              </Group>
              <Box 
                style={{ 
                  width: dimensions.width,
                  height: dimensions.height,
                  maxWidth: '100%',
                  margin: '0 auto',
                }}
              >
                <style>
                  {`
                    img-comparison-slider {
                      --divider-width: 4px;
                      --divider-color: ${isDarkHandle ? '#333' : '#fff'};
                      --default-handle-color: ${isDarkHandle ? '#333' : '#fff'};
                      --default-handle-shadow-color: ${isDarkHandle ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
                    }
                    img-comparison-slider[vertical] {
                      --divider-width: 4px;
                    }
                  `}
                </style>
                <ImgComparisonSlider
                  ref={sliderRef}
                  direction={isVertical ? 'vertical' : 'horizontal'}
                >
                  <img 
                    slot="first" 
                    src={basePngFile.url} 
                    alt="1x PNG baseline"
                    style={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                  <img 
                    slot="second" 
                    src={activeSelection.file.url} 
                    alt={`${activeSelection.variant.label} ${activeSelection.file.format}`}
                    style={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </ImgComparisonSlider>
              </Box>
              <Group justify="space-between" mt="xs" wrap="nowrap">
                <Badge variant="light" radius="sm">
                  {sliderBaseLabel || '1x PNG'} {basePngFile?.prettySize} (baseline)
                </Badge>
                <Badge variant="light" radius="sm">
                  {sliderActiveLabel || 'Select a variant'} {activeSelection?.file?.prettySize}
                </Badge>
              </Group>
            </Box>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}

export default ImageComparison
