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

import { Icon } from '@iconify/react';
import * as yaml from 'js-yaml';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectedClusters } from '../../lib/k8s';
import { KubeObjectClass } from '../../lib/k8s/cluster';
import { Activity } from '../activity/Activity';
import ActionButton from '../common/ActionButton';
import { AuthVisible } from '../common/Resource';
import { EditorDialog } from '../common/Resource';
import CreatePodForm from '../pod/CreatePodForm';

/** Props for {@link CreateResourceButton}. */
export interface CreateResourceButtonProps {
  resourceClass: KubeObjectClass;
  resourceName?: string;
}

/** Resource kinds that have a dedicated form component. Update this map when
 *  adding support for new resource types. */
const FORM_COMPONENTS: Record<
  string,
  React.ComponentType<{
    resource?: Record<string, any>;
    onChange: (resource: Record<string, any>) => void;
  }>
> = {
  Pod: CreatePodForm,
};

/** Parse a YAML string into a plain object. Returns `null` for non-empty
 *  invalid input so the form state is not overwritten mid-edit. */
function parseEditorObject(input: string): Record<string, any> | null {
  if (!input.trim()) return {};

  try {
    const parsed = yaml.load(input);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, any>;
    }
  } catch {
    // Ignore parse errors while editing incomplete YAML.
  }

  return null;
}

/** Inner component rendered inside the Activity panel. Holds shared state so the
 *  form can update the editor YAML in-place without relaunching the activity. */
function CreateResourceActivityContent(props: {
  resourceClass: KubeObjectClass;
  name: string;
  onClose: () => void;
}) {
  const { resourceClass, name, onClose } = props;
  const { t } = useTranslation(['glossary', 'translation']);

  const initialItem = React.useMemo(() => resourceClass.getBaseObject(), [resourceClass]);
  const [item, setItem] = React.useState<any>(initialItem);
  const [formResource, setFormResource] = React.useState<Record<string, any>>(initialItem);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleFormChange = (newItem: Record<string, any>) => {
    setFormResource(newItem);
    setItem(newItem);
  };

  const handleEditorChanged = (newValue: string) => {
    setErrorMessage('');
    const parsed = parseEditorObject(newValue);
    if (parsed !== null) {
      setFormResource(parsed);
    }
  };

  const FormComponent = FORM_COMPONENTS[resourceClass.kind];

  return (
    <EditorDialog
      noDialog
      item={item}
      open
      setOpen={() => {}}
      onClose={onClose}
      saveLabel={t('translation|Apply')}
      errorMessage={errorMessage}
      onEditorChanged={handleEditorChanged}
      treatItemChangesAsEdits
      title={t('translation|Create {{ name }}', { name })}
      aria-label={t('translation|Create {{ name }}', { name })}
      formContent={
        FormComponent ? (
          <FormComponent resource={formResource} onChange={handleFormChange} />
        ) : undefined
      }
    />
  );
}

/** Action button that opens an Activity panel with an EditorDialog for
 *  creating a Kubernetes resource. Shows a form tab when the resource kind
 *  has a matching entry in {@link FORM_COMPONENTS}. */
export function CreateResourceButton(props: CreateResourceButtonProps) {
  const { resourceClass, resourceName } = props;
  const { t } = useTranslation(['glossary', 'translation']);
  const clusters = useSelectedClusters();

  const name = resourceName ?? resourceClass.kind;
  const activityId = 'create-resource-' + resourceClass.apiName;

  const openActivity = () => {
    Activity.launch({
      id: activityId,
      title: t('translation|Create {{ name }}', { name }),
      location: 'full',
      cluster: clusters[0],
      icon: <Icon icon="mdi:plus-circle" />,
      content: (
        <CreateResourceActivityContent
          resourceClass={resourceClass}
          name={name}
          onClose={() => Activity.close(activityId)}
        />
      ),
    });
  };

  return (
    <AuthVisible item={resourceClass} authVerb="create">
      <ActionButton
        color="primary"
        description={t('translation|Create {{ name }}', { name })}
        icon={'mdi:plus-circle'}
        onClick={openActivity}
      />
    </AuthVisible>
  );
}
