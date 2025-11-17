import { Container, Paper, Title, Text, FileInput, Loader } from '@mantine/core'
import { IconUpload } from '@tabler/icons-react'

/**
 * Lightweight upload surface built around native HTML controls so the UI still works without any styling.
 */
const UploadPanel = ({ busy, statusMessage, onSelectFile }) => {
  const handleFileChange = (file) => {
    if (file && !busy) {
      onSelectFile(file)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file && !busy) {
      onSelectFile(file)
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  return (
    <Container size="lg" py="md">
      <Paper 
        shadow="sm" 
        p="xl" 
        radius="md" 
        withBorder
        onDrop={handleDrop} 
        onDragOver={handleDragOver}
      >
        <Title order={2} mb="md">Drop in your 3x source</Title>
        <Text mb="lg">
          Frida assumes your upload is a 3x density file. We will automatically derive lower-density siblings, keep
          metadata where possible, and display exact pixel math so you can double-check before downloading.
        </Text>

        <FileInput
          label="Select an image file"
          placeholder="Choose file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={busy}
          leftSection={<IconUpload size={16} />}
          mb="sm"
        />

        <Text size="sm" c="dimmed" mb="lg">
          Or drag the file onto this panel.
        </Text>

        {busy ? (
          <Text size="sm" c="blue">
            <Loader size="xs" type="dots" mr="xs" style={{ display: 'inline-block' }} />
            {statusMessage || 'Rendering variants...'}
          </Text>
        ) : (
          <Text size="sm" c="dimmed">
            {statusMessage || 'No file selected yet.'}
          </Text>
        )}
      </Paper>
    </Container>
  )
}

export default UploadPanel
