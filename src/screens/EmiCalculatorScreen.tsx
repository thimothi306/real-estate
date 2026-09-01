import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, Field } from '../components/ui';
import { colors, formatPrice, spacing } from '../theme';

/** Standard reducing-balance EMI formula. */
function calculateEmi(principal: number, annualRatePercent: number, years: number) {
  if (principal <= 0 || annualRatePercent <= 0 || years <= 0) {
    return { emi: 0, totalInterest: 0, totalPayment: 0 };
  }

  const monthlyRate = annualRatePercent / 12 / 100;
  const months = years * 12;
  const factor = Math.pow(1 + monthlyRate, months);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;

  return { emi, totalInterest, totalPayment };
}

export function EmiCalculatorScreen({ route }: any) {
  const initialPrice = (route.params as { price?: number } | undefined)?.price;

  const [loanAmount, setLoanAmount] = useState(initialPrice ? String(Math.round(initialPrice * 0.8)) : '5000000');
  const [rate, setRate] = useState('8.5');
  const [tenure, setTenure] = useState('20');

  const { emi, totalInterest, totalPayment } = useMemo(() => {
    const principal = Number(loanAmount.replace(/\D/g, '')) || 0;
    const annualRate = Number(rate) || 0;
    const years = Number(tenure) || 0;
    return calculateEmi(principal, annualRate, years);
  }, [loanAmount, rate, tenure]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>EMI Calculator</Text>
      <Text style={styles.subheading}>Estimate your monthly home loan installment.</Text>

      <Field
        label="Loan amount (₹)"
        value={loanAmount}
        onChangeText={(text) => setLoanAmount(text.replace(/\D/g, ''))}
        keyboardType="number-pad"
        placeholder="5000000"
      />

      <Field
        label="Interest rate (% per year)"
        value={rate}
        onChangeText={setRate}
        keyboardType="decimal-pad"
        placeholder="8.5"
      />

      <Field
        label="Loan tenure (years)"
        value={tenure}
        onChangeText={(text) => setTenure(text.replace(/\D/g, ''))}
        keyboardType="number-pad"
        placeholder="20"
      />

      <Card style={styles.resultCard}>
        <Text style={styles.resultLabel}>Monthly EMI</Text>
        <Text style={styles.resultValue}>{formatPrice(emi)}</Text>

        <View style={styles.divider} />

        <View style={styles.resultRow}>
          <Text style={styles.factLabel}>Principal amount</Text>
          <Text style={styles.factValue}>{formatPrice(Number(loanAmount.replace(/\D/g, '')) || 0)}</Text>
        </View>
        <View style={styles.resultRow}>
          <Text style={styles.factLabel}>Total interest</Text>
          <Text style={styles.factValue}>{formatPrice(totalInterest)}</Text>
        </View>
        <View style={styles.resultRow}>
          <Text style={styles.factLabel}>Total payment</Text>
          <Text style={styles.factValue}>{formatPrice(totalPayment)}</Text>
        </View>
      </Card>

      <Text style={styles.disclaimer}>
        This is an estimate for planning purposes only. Actual EMI depends on your lender's terms,
        processing fees, and eligibility.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  heading: { fontSize: 21, fontWeight: '700', color: colors.text },
  subheading: { fontSize: 13.5, color: colors.muted, marginTop: 4, marginBottom: spacing.xl },
  resultCard: { alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.lg },
  resultLabel: { fontSize: 13, color: colors.muted },
  resultValue: { fontSize: 30, fontWeight: '700', color: colors.primary, marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.border, width: '100%', marginVertical: spacing.md },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 6,
  },
  factLabel: { fontSize: 13.5, color: colors.muted },
  factValue: { fontSize: 13.5, color: colors.text, fontWeight: '600' },
  disclaimer: { fontSize: 12, color: colors.muted, lineHeight: 17, textAlign: 'center' },
});
