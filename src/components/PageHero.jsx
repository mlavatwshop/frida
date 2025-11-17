import { Container, Title, Text } from '@mantine/core'

// The hero is split into its own component so App.jsx stays focused on data flow.
// Keeping layout + copy isolated makes it easy to iterate on the welcome experience later.
const PageHero = () => {
  return (
    <Container size="lg" py="xl">
      <Title order={1}>Frida</Title>
      <Text size="lg" c="dimmed" mt="sm">
        Upload a 3x master. Get 2x, 1.5x, and 1x in PNG, JPEG, and WebP.
      </Text>
    </Container>
  )
}

export default PageHero
