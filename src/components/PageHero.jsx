import { Container, Title, Text, Group } from '@mantine/core'

// The hero is split into its own component so App.jsx stays focused on data flow.
// Keeping layout + copy isolated makes it easy to iterate on the welcome experience later.
const PageHero = () => {
  return (
    <Container size="lg" py="xl">
      <Group gap="sm" align="center">
        <img src="vite.svg" alt="Frida logo" style={{ width: '40px', height: '40px' }} />
        <Title order={1}>Frida</Title>
      </Group>
      <Text size="lg" c="dimmed" mt="sm">
        Upload a 3x master. Get 2x, 1.5x, and 1x in PNG, JPEG, and WebP.
      </Text>
    </Container>
  )
}

export default PageHero
