import { type ComponentType, lazy, type LazyExoticComponent } from 'react'

import type { ScenarioMeta } from '../utils/defineScenario'

type ScenarioModule = Promise<{ default: ComponentType }>

export interface ScenarioEntry extends ScenarioMeta {
  // Loaded the first time its page is opened, so each scenario is its own
  // chunk and the home page does not download every scenario's code
  Component: LazyExoticComponent<ComponentType>
  load: () => ScenarioModule
}

// Each scenario's metadata is repeated here so the router and the index page
// can list scenarios without loading them. defineScenario.test.tsx checks it
// against what each scenario file declares.
const scenario = (
  slug: string,
  difficulty: ScenarioMeta['difficulty'],
  load: () => ScenarioModule,
): ScenarioEntry => ({ slug, difficulty, Component: lazy(load), load })

// Every scenario, for the router and the index page, in the order the index
// page shows them
export const scenarios: ScenarioEntry[] = [
  scenario(
    'accessibility-violations',
    'medium',
    () => import('./accessibility-violations/AccessibilityViolations.scenario'),
  ),
  scenario(
    'actionability',
    'hard',
    () => import('./actionability/Actionability.scenario'),
  ),
  scenario(
    'add-remove',
    'easy',
    () => import('./add-remove/AddRemove.scenario'),
  ),
  scenario(
    'autocomplete',
    'hard',
    () => import('./autocomplete/Autocomplete.scenario'),
  ),
  scenario(
    'broken-images-and-links',
    'easy',
    () => import('./broken-images-and-links/BrokenImagesAndLinks.scenario'),
  ),
  scenario(
    'canvas-and-svg',
    'hard',
    () => import('./canvas-and-svg/CanvasAndSvg.scenario'),
  ),
  scenario(
    'challenging-selectors',
    'medium',
    () => import('./challenging-selectors/ChallengingSelectors.scenario'),
  ),
  scenario('check-box', 'easy', () => import('./check-box/CheckBox.scenario')),
  scenario(
    'clipboard',
    'medium',
    () => import('./clipboard/Clipboard.scenario'),
  ),
  scenario(
    'cookies-and-storage',
    'medium',
    () => import('./cookies-and-storage/CookiesAndStorage.scenario'),
  ),
  scenario(
    'date-picker',
    'hard',
    () => import('./date-picker/DatePicker.scenario'),
  ),
  scenario(
    'drag-and-drop-hard',
    'hard',
    () => import('./drag-and-drop-hard/DragAndDropHard.scenario'),
  ),
  scenario(
    'drag-and-drop',
    'medium',
    () => import('./drag-and-drop/DragAndDrop.scenario'),
  ),
  scenario('dropdown', 'easy', () => import('./dropdown/Dropdown.scenario')),
  scenario(
    'dynamic-loading',
    'medium',
    () => import('./dynamic-loading/DynamicLoading.scenario'),
  ),
  scenario(
    'dynamic-table',
    'hard',
    () => import('./dynamic-table/DynamicTable.scenario'),
  ),
  scenario(
    'file-upload',
    'medium',
    () => import('./file-upload/FileUpload.scenario'),
  ),
  scenario(
    'file-download',
    'medium',
    () => import('./file-download/FileDownload.scenario'),
  ),
  scenario(
    'form-validation',
    'medium',
    () => import('./form-validation/FormValidation.scenario'),
  ),
  scenario(
    'geolocation',
    'medium',
    () => import('./geolocation/Geolocation.scenario'),
  ),
  scenario('hovers', 'medium', () => import('./hovers/Hovers.scenario')),
  scenario('iframes', 'hard', () => import('./iframes/Iframes.scenario')),
  scenario(
    'infinite-scroll',
    'medium',
    () => import('./infinite-scroll/InfiniteScroll.scenario'),
  ),
  scenario(
    'js-alerts',
    'medium',
    () => import('./js-alerts/JsAlerts.scenario'),
  ),
  scenario(
    'key-presses',
    'medium',
    () => import('./key-presses/KeyPresses.scenario'),
  ),
  scenario(
    'login-form',
    'easy',
    () => import('./login-form/LoginForm.scenario'),
  ),
  scenario(
    'modal-dialogs',
    'medium',
    () => import('./modal-dialogs/ModalDialogs.scenario'),
  ),
  scenario(
    'mouse-interactions',
    'medium',
    () => import('./mouse-interactions/MouseInteractions.scenario'),
  ),
  scenario(
    'multi-step-form',
    'medium',
    () => import('./multi-step-form/MultiStepForm.scenario'),
  ),
  scenario(
    'multiple-file-upload',
    'medium',
    () => import('./multiple-file-upload/MultipleFileUpload.scenario'),
  ),
  scenario(
    'multiple-windows',
    'medium',
    () => import('./multiple-windows/MultipleWindows.scenario'),
  ),
  scenario(
    'notification',
    'medium',
    () => import('./notification/Notification.scenario'),
  ),
  scenario(
    'offline-and-network-status',
    'medium',
    () =>
      import('./offline-and-network-status/OfflineAndNetworkStatus.scenario'),
  ),
  scenario(
    'paginated-table',
    'medium',
    () => import('./paginated-table/PaginatedTable.scenario'),
  ),
  scenario(
    'radio-button',
    'easy',
    () => import('./radio-button/RadioButton.scenario'),
  ),
  scenario(
    'shadow-dom',
    'hard',
    () => import('./shadow-dom/ShadowDom.scenario'),
  ),
  scenario(
    'sortable-table',
    'medium',
    () => import('./sortable-table/SortableTable.scenario'),
  ),
  scenario(
    'slider-page',
    'medium',
    () => import('./slider-page/Slider.scenario'),
  ),
  scenario(
    'tabs-and-accordions',
    'easy',
    () => import('./tabs-and-accordions/TabsAndAccordions.scenario'),
  ),
  scenario(
    'time-and-timers',
    'hard',
    () => import('./time-and-timers/TimeAndTimers.scenario'),
  ),
  scenario(
    'tooltip-page',
    'easy',
    () => import('./tooltip-page/Tooltip.scenario'),
  ),
  scenario(
    'various-inputs',
    'easy',
    () => import('./various-inputs/VariousInputs.scenario'),
  ),
  scenario(
    'virtualised-list',
    'hard',
    () => import('./virtualised-list/VirtualisedList.scenario'),
  ),
]
