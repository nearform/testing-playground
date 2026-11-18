import {
  Notice,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@nearform/quantum'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../../components/Layout'
import PageSetup from '../../components/PageSetup'
import { translateInformation } from '../../utils/information'
import { SLUG } from './meta'

// The processes in the table. A row keeps its process's id, not its name,
// and the name is translated as the row is drawn, so it follows a language
// switch
const PROCESSES = ['system', 'chrome', 'docker', 'slack']

interface TableDataItem {
  id: string
  cpu: string
  memory: string
  network: string
  disk: string
}

function getRandomNumber(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function generateRandomTableData(id: string): TableDataItem {
  return {
    id,
    cpu: `${getRandomNumber(0, 100).toPrecision(3)}%`,
    memory: `${getRandomNumber(1024, 8192).toPrecision(4)} MB`,
    network: `${getRandomNumber(1, 1000).toPrecision(4)} Mbps`,
    disk: `${getRandomNumber(1, 100).toPrecision(4)} MB/s`,
  }
}

function shuffleData(data: TableDataItem[]): TableDataItem[] {
  const shuffledData = [...data]
  for (let i = shuffledData.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledData[i], shuffledData[j]] = [shuffledData[j], shuffledData[i]]
  }
  return shuffledData
}

function adjustValues(
  data: TableDataItem[],
  limit: number,
  key: keyof TableDataItem,
  precision: number,
): TableDataItem[] {
  const total = data.reduce((acc, row) => acc + parseFloat(row[key]), 0)
  if (total > limit) {
    const adjustmentFactor = limit / total
    data.forEach((row) => {
      if (key === 'cpu') {
        row[key] =
          (parseFloat(row[key]) * adjustmentFactor).toPrecision(precision) + '%'
      } else {
        row[key] =
          (parseFloat(row[key]) * adjustmentFactor).toPrecision(precision) +
          (key === 'memory' ? ' MB' : key === 'network' ? ' Mbps' : ' MB/s')
      }
    })
  }
  return data
}

const DynamicTable = (): JSX.Element => {
  const { t } = useTranslation()
  const name = (id: string): string => t(`scenarios.${SLUG}.${id}`)

  const [tableData, setTableData] = useState<TableDataItem[]>([])
  const [randomScenario, setRandomScenario] = useState<TableDataItem | null>(
    null,
  )

  useEffect(() => {
    const initialData = PROCESSES.map(generateRandomTableData)
    let shuffledData = shuffleData(initialData)
    shuffledData = adjustValues(shuffledData, 100, 'cpu', 3)
    shuffledData = adjustValues(shuffledData, 8192, 'memory', 4)
    shuffledData = adjustValues(shuffledData, 1000, 'network', 4)
    shuffledData = adjustValues(shuffledData, 500, 'disk', 4)

    const randomIndex = Math.floor(Math.random() * initialData.length)
    setRandomScenario(initialData[randomIndex])
    setTableData(shuffledData)
  }, [])

  function findCpuPercentage(data: TableDataItem[], id: string): string {
    const row = data.find((item) => item.id === id)
    return row != null ? `${parseFloat(row.cpu).toPrecision(3)}%` : 'N/A'
  }

  return (
    <Layout>
      <PageSetup
        title={t(`scenarios.${SLUG}.title`)}
        description={t(`scenarios.${SLUG}.description`)}
        information={translateInformation(t, `scenarios.${SLUG}.information`)}
      >
        <Table data-testid='dynamic-table' bordered className='w-full'>
          <TableHeader>
            <TableRow>
              <TableHead data-testid='dynamic-table-name-header'>
                {t(`scenarios.${SLUG}.name`)}
              </TableHead>
              <TableHead data-testid='dynamic-table-cpu-header'>
                {t(`scenarios.${SLUG}.cpu`)}
              </TableHead>
              <TableHead data-testid='dynamic-table-memory-header'>
                {t(`scenarios.${SLUG}.memory`)}
              </TableHead>
              <TableHead data-testid='dynamic-table-network-header'>
                {t(`scenarios.${SLUG}.network`)}
              </TableHead>
              <TableHead data-testid='dynamic-table-disk-header'>
                {t(`scenarios.${SLUG}.disk`)}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow data-testid={`dynamic-table-row-${index}`} key={index}>
                <TableCell data-testid={`dynamic-table-row-name-${index}`}>
                  {name(row.id)}
                </TableCell>
                <TableCell data-testid={`dynamic-table-row-cpu-${index}`}>
                  {row.cpu}
                </TableCell>
                <TableCell data-testid={`dynamic-table-row-memory-${index}`}>
                  {row.memory}
                </TableCell>
                <TableCell data-testid={`dynamic-table-row-network-${index}`}>
                  {row.network}
                </TableCell>
                <TableCell data-testid={`dynamic-table-row-disk-${index}`}>
                  {row.disk}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Notice
          variant='success'
          className='mt-8'
          data-testid='target-scenario'
        >
          {randomScenario != null && name(randomScenario.id)}{' '}
          {t(`scenarios.${SLUG}.cpu`)}:{' '}
          {findCpuPercentage(tableData, randomScenario?.id ?? '')}
        </Notice>
      </PageSetup>
    </Layout>
  )
}

export default DynamicTable
