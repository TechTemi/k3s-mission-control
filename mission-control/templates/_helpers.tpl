{{/*
Expand the name of the chart.
*/}}
{{- define "mission-control.name" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Full name — combines release name and chart name.
Truncated to 63 characters because Kubernetes names have a 63-character limit.
*/}}
{{- define "mission-control.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels applied to every resource in this chart.
*/}}
{{- define "mission-control.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/name: {{ include "mission-control.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels — used in spec.selector and pod template labels.
These must stay stable across upgrades.
*/}}
{{- define "mission-control.selectorLabels" -}}
app.kubernetes.io/name: {{ include "mission-control.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}