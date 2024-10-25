import { GenericContainer } from "./generic-container";
import { getContainerIds, getDockerEventStream, waitForDockerEvent } from "../utils/test-helper";
import { RandomUuid } from "../common";

describe("GenericContainer remove", () => {
  jest.setTimeout(180_000);

  it("should remove a stopped container by default", async () => {
    const container = await new GenericContainer("cristianrgreco/testcontainer:1.1.14")
      .withName(`container-${new RandomUuid().nextUuid()}`)
      .start();

    await container.stop();

    expect(await getContainerIds()).not.toContain(container.getId());
  });

  it("should not remove a stopped container if remove option is false", async () => {
    const container = await new GenericContainer("cristianrgreco/testcontainer:1.1.14")
      .withName(`container-${new RandomUuid().nextUuid()}`)
      .start();

    await container.stop({ remove: false });

    expect(await getContainerIds()).toContain(container.getId());
  });

  it("should not remove container if configured to not remove when stopped", async () => {
    const container = await new GenericContainer("cristianrgreco/testcontainer:1.1.14")
      .withName(`container-${new RandomUuid().nextUuid()}`)
      .withRemoveWhenStopped(false)
      .start();

    await container.stop();

    expect(await getContainerIds()).toContain(container.getId());
  });

  it("should remove container when stopped if configured to auto remove", async () => {
    const container = await new GenericContainer("cristianrgreco/testcontainer:1.1.14")
      .withName(`container-${new RandomUuid().nextUuid()}`)
      .withAutoRemove(true)
      .start();

    const dockerEventStream = await getDockerEventStream();
    const dockerContainerDestroyEventPromise = waitForDockerEvent(dockerEventStream, "destroy");
    await container.stop();
    await dockerContainerDestroyEventPromise;
    dockerEventStream.destroy();

    expect(await getContainerIds()).not.toContain(container.getId());
  });

  it("should remove container when stopped if configured to auto remove even if attempted override", async () => {
    const container = await new GenericContainer("cristianrgreco/testcontainer:1.1.14")
      .withName(`container-${new RandomUuid().nextUuid()}`)
      .withAutoRemove(true)
      .start();

    const dockerEventStream = await getDockerEventStream();
    const dockerContainerDestroyEventPromise = waitForDockerEvent(dockerEventStream, "destroy");
    await container.stop({ remove: false });
    await dockerContainerDestroyEventPromise;
    dockerEventStream.destroy();

    expect(await getContainerIds()).not.toContain(container.getId());
  });
});
