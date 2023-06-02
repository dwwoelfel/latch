import {Container, Title} from '@mantine/core';
import {CreateEnvironmentForm} from './CreateEnvironmentForm';

export function NewEnvironmentPage() {
  return (
    <Container size="sm">
      <Title order={3} mb="sm">
        Create environment
      </Title>

      <Container size="xs" p={0} m={0}>
        <CreateEnvironmentForm />
      </Container>
    </Container>
  );
}
