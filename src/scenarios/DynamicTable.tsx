import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography
} from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Layout from '../components/Layout'
import PageSetup from '../components/PageSetup'

interface TableDataItem {
  name: string
  cpu: string
  memory: string
  network: string
  disk: string
}

function getRandomNumber (min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function generateRandomTableData (name: string): TableDataItem {
  return {
    name,
    cpu: `${getRandomNumber(0, 100).toPrecision(3)}%`,
    memory: `${getRandomNumber(1024, 8192).toPrecision(4)} MB`,
    network: `${getRandomNumber(1, 1000).toPrecision(4)} Mbps`,
    disk: `${getRandomNumber(1, 100).toPrecision(4)} MB/s`
  }
}

function shuffleData (data: TableDataItem[]): TableDataItem[] {
  const shuffledData = [...data]
  for (let i = shuffledData.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledData[i], shuffledData[j]] = [shuffledData[j], shuffledData[i]]
  }
  return shuffledData
}

function adjustValues (
  data: TableDataItem[],
  limit: number,
  key: keyof TableDataItem,
  precision: number
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
  const initialData: TableDataItem[] = [
    generateRandomTableData(t('scenarios.dynamic-table.system')),
    generateRandomTableData(t('scenarios.dynamic-table.chrome')),
    generateRandomTableData(t('scenarios.dynamic-table.docker')),
    generateRandomTableData(t('scenarios.dynamic-table.slack'))
  ]

  const [tableData, setTableData] = useState<TableDataItem[]>([])
  const [randomScenario, setRandomScenario] = useState<TableDataItem | null>(
    null
  )

  useEffect(() => {
    let shuffledData = shuffleData(initialData)
    shuffledData = adjustValues(shuffledData, 100, 'cpu', 3)
    shuffledData = adjustValues(shuffledData, 8192, 'memory', 4)
    shuffledData = adjustValues(shuffledData, 1000, 'network', 4)
    shuffledData = adjustValues(shuffledData, 500, 'disk', 4)

    const randomIndex = Math.floor(Math.random() * initialData.length)
    setRandomScenario(initialData[randomIndex])
    setTableData(shuffledData)
  }, [])

  function findCpuPercentage (data: TableDataItem[], name: string): string {
    const row = data.find((item) => item.name === name)
    return row != null ? `${parseFloat(row.cpu).toPrecision(3)}%` : 'N/A'
  }

  return (
    <Layout>
      <PageSetup
        title={t('scenarios.dynamic-table.title')}
        description={t('scenarios.dynamic-table.description')}
        information={t('scenarios.dynamic-table.information')}
      />

      {/* Render the Material-UI table */}
      <Table data-testid='dynamic-table'>
        <TableHead>
          <TableRow>
            <TableCell data-testid='dynamic-table-name-header'>
              {t('scenarios.dynamic-table.name')}
            </TableCell>
            <TableCell data-testid='dynamic-table-cpu-header'>
              {t('scenarios.dynamic-table.cpu')}
            </TableCell>
            <TableCell data-testid='dynamic-table-memory-header'>
              {t('scenarios.dynamic-table.memory')}
            </TableCell>
            <TableCell data-testid='dynamic-table-network-header'>
              {t('scenarios.dynamic-table.network')}
            </TableCell>
            <TableCell data-testid='dynamic-table-disk-header'>
              {t('scenarios.dynamic-table.disk')}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.map((row, index) => (
            <TableRow data-testid={`dynamic-table-row-${index}`} key={index}>
              <TableCell data-testid={`dynamic-table-row-name-${index}`}>
                {row.name}
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
      <Box>
        <Typography
          sx={{ mt: 4, backgroundColor: 'yellowgreen', textAlign: 'center' }}
          data-testid={t('scenarios.dynamic-table.target-scenario')}
        >
          {randomScenario?.name} {t('scenarios.dynamic-table.cpu')}:{' '}
          {findCpuPercentage(tableData, randomScenario?.name ?? '')}
        </Typography>
      </Box>
    </Layout>
  )
}

export default DynamicTable
