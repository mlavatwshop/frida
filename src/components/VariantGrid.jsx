import { Container, Paper, Title, Text, Button, Table, Group, Stack } from '@mantine/core'
import { IconDownload } from '@tabler/icons-react'

/**
 * Renders a list of generated variants. Each variant lists the formats that are ready to download.
 */
const VariantGrid = ({ variants, onDownload, onDownloadAll, emptyState }) => {
  if (!variants.length) {
    return (
      <Container size="lg" py="md">
        <Paper shadow="sm" p="xl" radius="md" withBorder>
          <Text c="dimmed">{emptyState}</Text>
        </Paper>
      </Container>
    )
  }

  // Helper to trigger sequential downloads with a delay between each
  const handleDownloadAll = async () => {
    console.log('[Download All] 📦 Starting batch download of all variants...')
    
    const allFiles = variants.flatMap(variant => variant.files)
    
    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i]
      console.log(`[Download All] ${i + 1}/${allFiles.length} - ${file.suggestedName}`)
      
      // Create a temporary link and click it
      const link = document.createElement('a')
      link.href = file.url
      link.download = file.suggestedName
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Small delay between downloads to avoid browser blocking
      if (i < allFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    if (onDownloadAll) {
      onDownloadAll(allFiles)
    }
    
    console.log('[Download All] ✅ All downloads initiated!')
  }

  return (
    <Container size="lg" py="md">
      <Group justify="space-between" mb="md">
        <Title order={2}>Generated Variants</Title>
        <Button 
          leftSection={<IconDownload size={16} />}
          onClick={handleDownloadAll}
          variant="filled"
        >
          Download All
        </Button>
      </Group>
      
      <Stack gap="md">
        {variants.map((variant) => (
          <Paper key={variant.label} shadow="sm" p="xl" radius="md" withBorder>
            <Title order={3} mb="xs">{variant.label}</Title>
            <Text size="sm" c="dimmed" mb="md">
              {variant.width} × {variant.height}px
            </Text>
            
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Format</Table.Th>
                  <Table.Th>Size</Table.Th>
                  <Table.Th>Action</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {variant.files.map((file) => (
                  <Table.Tr key={`${variant.label}-${file.format}`}>
                    <Table.Td>
                      <Text fw={600}>{file.format}</Text>
                      <Text size="xs" c="dimmed">{file.mime}</Text>
                    </Table.Td>
                    <Table.Td>{file.prettySize}</Table.Td>
                    <Table.Td>
                      <Button
                        component="a"
                        href={file.url}
                        download={file.suggestedName}
                        size="xs"
                        variant="light"
                        leftSection={<IconDownload size={14} />}
                        onClick={() => onDownload(file)}
                      >
                        Download
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        ))}
      </Stack>
    </Container>
  )
}

export default VariantGrid
