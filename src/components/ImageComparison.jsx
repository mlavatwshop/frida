import { useState, useMemo } from 'react'
import { Container, Paper, Title, Text, Table, Stack, Box } from '@mantine/core'
import {
  ImgComparisonSlider,
} from '@img-comparison-slider/react'

/**
 * Displays a comparison table and interactive slider to compare image variants
 */
const ImageComparison = ({ variants }) => {
  const [selectedImage, setSelectedImage] = useState(null)

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

  // Organize data for the table: rows = formats, columns = scales
  const formats = ['PNG', 'JPEG', 'WebP']
  const scales = variants.map(v => v.label)

  const handleCellClick = (variant, file) => {
    setSelectedImage({ variant, file })
  }

  // Get the base 1x PNG for comparison
  const basePngFile = baseImage.files.find(f => f.format === 'PNG')

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
                Comparing: 1x PNG (baseline) ↔ {activeSelection.variant.label} {activeSelection.file.format}
              </Text>
              <Box 
                style={{ 
                  width: dimensions.width,
                  height: dimensions.height,
                  maxWidth: '100%',
                  margin: '0 auto',
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
              </Box>
            </Box>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}

export default ImageComparison
