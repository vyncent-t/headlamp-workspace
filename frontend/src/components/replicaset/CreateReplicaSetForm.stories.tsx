/*
 * Copyright 2025 The Kubernetes Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import { TestContext } from '../../test';
import CreateReplicaSetForm, {
  CreateReplicaSetFormProps,
  ReplicaSetDraft,
} from './CreateReplicaSetForm';

export default {
  title: 'ReplicaSets/CreateReplicaSetForm',
  component: CreateReplicaSetForm,
  argTypes: { onChange: { action: 'changed' } },
  decorators: [
    Story => (
      <TestContext>
        <Story />
      </TestContext>
    ),
  ],
} as Meta;

/** Wraps the form with local state so that user edits and the on-mount
 *  `app=headlamp` pod-template-labels seeding actually update the visible
 *  resource (and re-render the form). The supplied `onChange` arg is still
 *  invoked so the Storybook Actions panel logs every change. */
const Template: StoryFn<CreateReplicaSetFormProps> = args => {
  const [resource, setResource] = React.useState<ReplicaSetDraft | undefined>(args.resource);
  return (
    <CreateReplicaSetForm
      {...args}
      resource={resource}
      onChange={next => {
        setResource(next);
        args.onChange?.(next);
      }}
    />
  );
};

/** Default state matching `ReplicaSet.getBaseObject()` (the YAML the editor
 *  shows for a brand-new ReplicaSet). Pod template labels start empty so the
 *  on-mount effect seeds them with `{ app: 'headlamp' }`, and that row will
 *  immediately show a green check (matches `spec.selector.matchLabels`). */
export const Default = Template.bind({});
Default.args = {
  resource: {
    apiVersion: 'apps/v1',
    kind: 'ReplicaSet',
    metadata: {
      name: '',
      namespace: '',
    },
    spec: {
      replicas: 1,
      selector: { matchLabels: { app: 'headlamp' } },
      template: {
        spec: {
          containers: [
            {
              name: '',
              image: '',
              imagePullPolicy: 'Always',
            },
          ],
          nodeName: '',
        },
      },
    },
  },
};

/** Pre-filled with values that satisfy the form so the labels-vs-selector
 *  row shows the success (green check) state. */
export const Filled = Template.bind({});
Filled.args = {
  resource: {
    apiVersion: 'apps/v1',
    kind: 'ReplicaSet',
    metadata: {
      name: 'my-replicaset',
      namespace: 'default',
      labels: { app: 'headlamp' },
    },
    spec: {
      replicas: 3,
      selector: { matchLabels: { app: 'headlamp' } },
      template: {
        metadata: { labels: { app: 'headlamp' } },
        spec: {
          containers: [
            {
              name: 'app',
              image: 'nginx:1.27',
              ports: [{ containerPort: 80 }],
              imagePullPolicy: 'IfNotPresent',
            },
          ],
        },
      },
    },
  },
};
