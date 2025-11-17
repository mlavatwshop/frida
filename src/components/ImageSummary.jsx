import { Container, Paper, Title, Text, Image, Grid } from '@mantine/core'

/**
 * Displays metadata for the uploaded master asset so designers can sanity-check numbers.
 */
const ImageSummary = ({ meta }) => {
  if (!meta) {
    return null
  }

  const logicalWidth = Math.round(meta.width / 3)
  const logicalHeight = Math.round(meta.height / 3)

  const displayType = meta.type ? meta.type.replace('image/', '').toUpperCase() : 'IMAGE'

  return (
    <Container size="lg" py="md">
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Title order={3} mb="md">Master details</Title>
        
        <Grid gutter="md" mb="lg">
          <Grid.Col span={6}>
            <Text size="sm" fw={500} c="dimmed">Type</Text>
            <Text size="md">{displayType}</Text>
          </Grid.Col>
          
          <Grid.Col span={6}>
            <Text size="sm" fw={500} c="dimmed">File name</Text>
            <Text size="md">{meta.name}</Text>
          </Grid.Col>
          
          <Grid.Col span={6}>
            <Text size="sm" fw={500} c="dimmed">Dimensions</Text>
            <Text size="md">
              {meta.width} × {meta.height}px{' '}
              <Text span size="sm" c="dimmed">
                (about {logicalWidth} × {logicalHeight}px at 1x)
              </Text>
            </Text>
          </Grid.Col>
          
          <Grid.Col span={6}>
            <Text size="sm" fw={500} c="dimmed">Size</Text>
            <Text size="md">{meta.prettySize}</Text>
          </Grid.Col>
        </Grid>
        
        {meta.previewUrl && (
          <div>
            <Image 
              src={meta.previewUrl} 
              alt={`Preview of ${meta.name}`}
              radius="md"
              fit="contain"
              maw="100%"
            />
            <Text size="sm" c="dimmed" ta="center" mt="xs">Preview</Text>
          </div>
        )}
      </Paper>
    </Container>
  )
}

export default ImageSummary
