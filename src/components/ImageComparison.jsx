import { useState, useMemo } from 'react'
import { Container, Paper, Title, Text, Table, Stack, Box } from '@mantine/core'
import {
  ImgComparisonSlider,
} from '@img-comparison-slider/react'

/**
 * Displays a comparison table and interactive slider to compare image variants
 */
const ImageComparison = ({ variants, sourceImage }) => {
  const [selectedImage, setSelectedImage] = useState(null)

  const sourceVariant = useMemo(() => {
    if (!sourceImage?.previewUrl) return null

    const format = (() => {
      if (!sourceImage.type) return 'Original'
      if (sourceImage.type.includes('png')) return 'PNG'
      if (sourceImage.type.includes('jpeg') || sourceImage.type.includes('jpg')) return 'JPEG'
      if (sourceImage.type.includes('webp')) return 'WebP'
      return 'Original'
    })()

    return {
      label: '3x',
      width: sourceImage.width,
      height: sourceImage.height,
      files: [
        {
          format,
          mime: sourceImage.type,
          size: sourceImage.size,
          prettySize: sourceImage.prettySize,
          url: sourceImage.previewUrl,
          suggestedName: sourceImage.name,
        },
      ],
    }
  }, [sourceImage])

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

  const comparisonVariants = useMemo(() => {
    if (sourceVariant) {
      return [sourceVariant, ...variants]
    }
    return variants
  }, [sourceVariant, variants])

  // Get default selected image (2x PNG) or use the current selection
  const activeSelection = useMemo(() => {
    if (selectedImage) return selectedImage
    
    // Default to 2x PNG if available
    if (variants.length > 0) {
      const twoXVariant = variants.find(v => v.label === '2x')
      if (twoXVariant) {
        const pngFile = twoXVariant.files.find(f => f.format === 'PNG')
        if (pngFile) {
          return { variant: twoXVariant, file: pngFile }
        }
      }
    }
    return null
  }, [variants, selectedImage])

  if (!variants.length || !baseImage) {
    return null
  }

  // Organize data for the table: rows = formats, columns = scales (including optional 3x source)
  const formats = ['PNG', 'JPEG', 'WebP']
  const scales = comparisonVariants.map(v => v.label)

  const handleCellClick = (variant, file) => {
    setSelectedImage({ variant, file })
  }

  // Get the base 1x PNG for comparison
  const basePngFile = baseImage?.files.find(f => f.format === 'PNG')
  const sliderBaseLabel = baseImage && basePngFile ? `${baseImage.label} ${basePngFile.format}` : ''
  const sliderActiveLabel = activeSelection
    ? `${activeSelection.variant.label} ${activeSelection.file.format}`
    : ''
  const sliderLabelStyles = {
    position: 'absolute',
    bottom: 12,
    padding: '4px 8px',
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    color: 'white',
    fontSize: '0.75rem',
    pointerEvents: 'none',
    lineHeight: 1.2,
  }

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
                  {comparisonVariants.map(variant => {
                    const file = variant.files.find(f => f.format === format)
                    const isSelected = activeSelection?.file?.url === file?.url
                    const isBase = variant.label === '1x' && format === 'PNG'
                    
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
                          <>
                            <Text size="sm">{file.prettySize}</Text>
                            {isBase && (
                              <Text size="xs" c="dimmed">(baseline)</Text>
                            )}
                          </>
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
              <Text size="sm" fw={500} mb="xs">
                Comparing: {sliderBaseLabel || '1x PNG'} (baseline) ↔ {sliderActiveLabel}
              </Text>
              <Box 
                style={{ 
                  width: dimensions.width,
                  height: dimensions.height,
                  maxWidth: '100%',
                  margin: '0 auto',
                  position: 'relative',
                }}
              >
                <ImgComparisonSlider>
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
                {sliderBaseLabel && (
                  <Box style={{ ...sliderLabelStyles, left: 12 }}>
                    <Text size="xs" fw={600}>
                      {sliderBaseLabel}
                    </Text>
                  </Box>
                )}
                {sliderActiveLabel && (
                  <Box style={{ ...sliderLabelStyles, right: 12, textAlign: 'right' }}>
                    <Text size="xs" fw={600}>
                      {sliderActiveLabel}
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}

export default ImageComparison
