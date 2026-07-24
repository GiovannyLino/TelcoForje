// Logos de parceiros para o carrossel do login. Onde há asset aberto oficial
// (Simple Icons / VectorLogoZone) ele é usado; as marcas de telecom sem asset
// aberto são representações vetoriais próprias, em cores de marca, para uso
// apenas ilustrativo em ambiente de demonstração.
import cisco from './vendors/cisco.svg'
import redhat from './vendors/redhat.svg'
import fortinet from './vendors/fortinet.svg'
import splunk from './vendors/splunk.svg'
import vmware from './vendors/vmware.svg'
import ibm from './vendors/ibm.svg'
import claro from './vendors/claro.svg'
import tim from './vendors/tim.svg'
import vivo from './vendors/vivo.svg'
import netscout from './vendors/netscout.svg'
import thousandeyes from './vendors/thousandeyes.svg'
import embratel from './vendors/embratel.svg'
import vtal from './vendors/vtal.svg'

export type Partner = { name: string; src: string; kind: 'icon' | 'wordmark' }

// Ordem intercalada (símbolos e wordmarks) para o carrossel ficar equilibrado.
export const PARTNERS: Partner[] = [
  { name: 'Cisco', src: cisco, kind: 'icon' },
  { name: 'TIM', src: tim, kind: 'wordmark' },
  { name: 'Splunk', src: splunk, kind: 'icon' },
  { name: 'Vivo', src: vivo, kind: 'wordmark' },
  { name: 'Fortinet', src: fortinet, kind: 'icon' },
  { name: 'NETSCOUT', src: netscout, kind: 'wordmark' },
  { name: 'IBM', src: ibm, kind: 'wordmark' },
  { name: 'Claro', src: claro, kind: 'wordmark' },
  { name: 'VMware', src: vmware, kind: 'icon' },
  { name: 'ThousandEyes', src: thousandeyes, kind: 'wordmark' },
  { name: 'Red Hat', src: redhat, kind: 'icon' },
  { name: 'Embratel', src: embratel, kind: 'wordmark' },
  { name: 'V.tal', src: vtal, kind: 'wordmark' },
]
